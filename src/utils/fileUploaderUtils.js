import mime from 'mime';
import ExifReader from 'exifreader';
import JSZip from 'jszip';
import { lxDateUtils, lxDevUtils } from '@/utils';
import useLx from '@/hooks/useLx';

const DASH = '—';

export function acceptedMimeImage(name) {
  const mimeType = mime.getType(name);
  // List of valid mime types for exifreader library
  const validMimeTypes = [
    'image/jpeg',
    'image/tiff',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'image/gif',
    'image/jfif',
    'image/png_file',
    'image/exif',
    'image/iptc',
    'image/xmp',
    'image/icc',
    'image/mpf',
    'image/avif',
    'image/photoshop',
    'image/thumbnail',
  ];

  return validMimeTypes.includes(mimeType);
}

export function acceptedMimeArchive(name) {
  const mimeType = mime.getType(name);
  const validMimeTypes = ['application/zip'];

  return validMimeTypes.includes(mimeType);
}

export function acceptedMimeOffice(name) {
  const mimeType = mime.getType(name);
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  return validMimeTypes.includes(mimeType);
}

function isMacOsMetaFile(filename) {
  // Check if the file is a Mac-specific __MACOSX and ._  metadata file
  return filename.startsWith('__MACOSX') || filename.startsWith('._');
}

export function checkExtension(extension, allowedExtensions) {
  const mimeType = mime.getType(extension);

  if (!mimeType) {
    return false;
  }
  // mime library cannot determine image/*, so we need to check it manually
  if (mimeType.startsWith('image/') && allowedExtensions.includes('image/*')) {
    return true;
  }

  const isExtensionAllowed = allowedExtensions.includes(extension);
  const isMIMETypeAllowed = allowedExtensions.includes(mimeType);

  return isExtensionAllowed || isMIMETypeAllowed;
}

export function convertBytesToFormattedString(bytes) {
  if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(2).replace('.', ',')} KiB`;
  }
  return `${(bytes / 1048576).toFixed(2).replace('.', ',')} MiB`;
}

function addFileToArchive(archive, zipEntry, size) {
  const parts = zipEntry.name.split('/');
  let currentLevel = archive;

  parts.forEach((part, index) => {
    let existingPart = currentLevel.find((item) => item.name === part);

    if (!existingPart) {
      existingPart = {
        name: part,
        path: parts.slice(0, index + 1).join('/'),
        size: index === parts.length - 1 && !zipEntry.dir ? size : 0,
        children: index === parts.length - 1 && !zipEntry.dir ? null : [],
      };

      currentLevel.push(existingPart);
    }

    if (index === parts.length - 1 && !zipEntry.dir) {
      existingPart.size = size;
    }

    if (existingPart.children !== null) {
      currentLevel = existingPart.children;
    }
  });
}

function getArchiveContentData(archive) {
  return archive.map((file) => {
    const descriptionSizeString =
      file.size === 0 ? '' : `${convertBytesToFormattedString(file.size)}`;
    const descriptionNameString = file.children
      ? ''
      : `${file.name.split('.').pop().toUpperCase()}`;

    return {
      id: file.name,
      name: file.name,
      description: [descriptionSizeString, descriptionNameString].filter(Boolean).join(', '),
      path: file.path,
      size: file.size,
      children: file.children ? getArchiveContentData(file.children) : null,
      category: file.children ? null : 'blue',
    };
  });
}

function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  return xmlDoc;
}

function extractAllMetadata(xmlDoc) {
  const meta = {};
  const elements = xmlDoc.getElementsByTagName('*');

  Array.from(elements).forEach((element) => {
    const key = element.tagName.includes(':') ? element.tagName.split(':')[1] : element.tagName;
    meta[key] = element.textContent;
  });

  return meta;
}

export async function getMeta(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const meta = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;

        // Handle image files with ExifReader
        if (acceptedMimeImage(file.name)) {
          const exif = ExifReader.load(arrayBuffer);
          meta.exif = exif;
        }

        // Handle zip archive files
        if (acceptedMimeArchive(file.name)) {
          const zip = await JSZip.loadAsync(arrayBuffer);

          const promises = [];
          meta.archive = [];
          zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir && !isMacOsMetaFile(zipEntry.name)) {
              promises.push(
                zipEntry.async('arraybuffer').then((data) => {
                  addFileToArchive(meta.archive, zipEntry, data.byteLength);
                })
              );
            }
          });

          await Promise.all(promises);
          meta.archive = getArchiveContentData(meta.archive);
        }

        // Handle Office files (docx, pptx, xlsx)
        if (acceptedMimeOffice(file.name)) {
          const zip = await JSZip.loadAsync(arrayBuffer);

          const coreXmlFile = zip.file('docProps/core.xml');
          const appXmlFile = zip.file('docProps/app.xml');

          const promises = [];
          meta.officeMeta = { exifData: [] };

          if (coreXmlFile) {
            const coreXmlContentPromise = coreXmlFile.async('string').then((coreXmlContent) => {
              const coreXml = parseXML(coreXmlContent);
              meta.officeMeta.core = extractAllMetadata(coreXml);
            });
            promises.push(coreXmlContentPromise);
          }

          if (appXmlFile) {
            const appXmlContentPromise = appXmlFile.async('string').then((appXmlContent) => {
              const appXml = parseXML(appXmlContent);
              meta.officeMeta.app = extractAllMetadata(appXml);
            });
            promises.push(appXmlContentPromise);
          }
          await Promise.all(promises);
        }

        // Add new meta... types here

        resolve(meta);
      } catch (error) {
        if (error.message === 'Encrypted zip are not supported') {
          reject(new Error('password-protected'));
        } else {
          reject(error);
        }
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function getContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Content = e.target.result;
      const originalFile = file;
      resolve({ base64Content, originalFile });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function findExifHeightAndWidth(exif) {
  if (exif && exif['Image Height'] && exif['Image Width']) {
    return `${exif['Image Height'].value} × ${exif['Image Width'].value} px`;
  }
  return '';
}

function handleOfficeFile(count, labelSingle, labelMulti) {
  const pageCountSingle = Number(count) === 1 && labelSingle ? `${count} ${labelSingle}` : '';
  const pageCountMulti = Number(count) > 1 && labelMulti ? `${count} ${labelMulti}` : '';
  return [pageCountSingle, pageCountMulti].filter(Boolean).join(', ');
}

export function getExtraParameter(meta, texts) {
  if (!meta) return null;

  switch (true) {
    // If it's Image with exif data
    case Object.prototype.hasOwnProperty.call(meta, 'exif'):
      return findExifHeightAndWidth(meta.exif);

    // If it's a ZIP file
    case Object.prototype.hasOwnProperty.call(meta, 'archive'): {
      const fileCountSingle =
        meta.archive.length === 1 && texts.metaAdditionalInfoFileCountLabelSingle
          ? `${meta.archive.length} ${texts.metaAdditionalInfoFileCountLabelSingle}`
          : '';
      const fileCountMulti =
        meta.archive.length > 1 && texts.metaAdditionalInfoFileCountLabelMulti
          ? `${meta.archive.length} ${texts.metaAdditionalInfoFileCountLabelMulti}`
          : '';

      const text = [fileCountSingle, fileCountMulti].filter(Boolean).join(', ');
      return text;
    }

    // If it's a Office file
    case Object.prototype.hasOwnProperty.call(meta, 'officeMeta'): {
      let text;
      switch (meta.type) {
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          text = handleOfficeFile(
            meta.officeMeta?.app?.Slides,
            texts.metaAdditionalInfoSlideCountLabelSingle,
            texts.metaAdditionalInfoSlideCountLabelMulti
          );
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          text = handleOfficeFile(
            meta.officeMeta?.app?.Pages,
            texts.metaAdditionalInfoPageCountLabelSingle,
            texts.metaAdditionalInfoPageCountLabelMulti
          );
          break;
        default:
          text = '';
      }
      return text;
    }

    // Add new extra parameter types here

    // Case when meta contain only "additionalInfo" param to show additional info
    case Object.prototype.hasOwnProperty.call(meta, 'additionalInfo'): {
      return meta.additionalInfo;
    }

    default:
      return null;
  }
}

export function getFileExtension(name) {
  const mimeType = mime.getType(name);

  if (mimeType) {
    const extension = mime.getExtension(mimeType);
    if (extension) {
      return extension.toUpperCase();
    }
  }

  const parts = name.split('.');
  if (parts.length === 1) {
    return lxDevUtils.log(
      `Cannot determine extension for file: ${name}`,
      useLx().getGlobals()?.environment,
      'error'
    );
  }
  return parts.pop().toUpperCase();
}

function getFormatTime(timeStomp) {
  if (!timeStomp) return null;
  return lxDateUtils.formatDateTime(new Date(timeStomp));
}

function stringToDate(dateString) {
  if (!dateString) return null;
  const formattedDateString = dateString.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const date = new Date(formattedDateString);
  return date.toLocaleString();
}

function getImageMainData(advancedFile, texts) {
  const author =
    advancedFile.meta.exif?.Artist?.description ||
    advancedFile.meta.exif?.XPAuthor?.description ||
    null;
  const format = getFileExtension(advancedFile.name) || DASH;
  const size = convertBytesToFormattedString(advancedFile.meta.size) || DASH;
  const resolution = findExifHeightAndWidth(advancedFile.meta.exif) || DASH;
  const creationDate =
    getFormatTime(stringToDate(advancedFile.meta.exif?.DateTime?.description)) ||
    getFormatTime(stringToDate(advancedFile.meta.exif?.DateTimeOriginal?.description)) ||
    DASH;
  const lastChanges = getFormatTime(advancedFile.meta.lastModified) || DASH;
  const mainData = {
    author: {
      label: texts.metaMainAuthor,
      value: author,
    },
    format: {
      label: texts.metaMainFormat,
      value: format,
    },
    size: {
      label: texts.metaMainDataSize,
      value: size,
    },
    resolution: {
      label: texts.metaMainImageDimensions,
      value: resolution,
    },
    creationDate: {
      label: texts.metaMainDateCreated,
      value: creationDate,
    },
    lastChanges: {
      label: texts.metaMainLastModified,
      value: lastChanges,
    },
  };

  return mainData;
}

function getOfficeFileMainData(advancedFile, texts) {
  const authorString = advancedFile.meta?.officeMeta?.core?.creator || null;
  const author = authorString
    ?.split(/[,;]/)
    .map((a) => a.trim())
    .filter(Boolean);

  const format = getFileExtension(advancedFile.name) || DASH;
  const size = convertBytesToFormattedString(advancedFile.meta.size) || DASH;
  const creationDate = getFormatTime(advancedFile.meta?.officeMeta?.core?.created) || DASH;
  const lastChanges = getFormatTime(advancedFile.meta?.officeMeta?.core?.modified) || DASH;
  const title = advancedFile.meta?.officeMeta?.core?.title || DASH;
  const description = advancedFile.meta?.officeMeta?.core?.description || DASH;
  const mainData = {
    author: {
      label: texts.metaMainAuthor,
      value: author,
    },
    format: {
      label: texts.metaMainFormat,
      value: format,
    },
    size: {
      label: texts.metaMainDataSize,
      value: size,
    },
    creationDate: {
      label: texts.metaMainDateCreated,
      value: creationDate,
    },
    lastChanges: {
      label: texts.metaMainLastModified,
      value: lastChanges,
    },
    title: {
      label: texts.metaMainTitle,
      value: title,
    },
    description: {
      label: texts.metaMainDescription,
      value: description,
    },
  };

  return mainData;
}

function getImageData(exif, texts) {
  const imageDate = {
    width: {
      label: texts.metaImageWidth,
      value: exif['Image Width']?.description || '—',
    },
    height: {
      label: texts.metaImageHeight,
      value: exif['Image Height']?.description || '—',
    },
    XResolution: {
      label: texts.metaImageHorizontalResolution,
      value: exif?.XResolution?.description || '—',
    },
    YResolution: {
      label: texts.metaImageVerticalResolution,
      value: exif?.YResolution?.description || '—',
    },
    cameraBrand: {
      label: texts.metaCameraBrand,
      value: exif?.Make?.description || '—',
    },
    model: {
      label: texts.metaCameraModel,
      value: exif?.Model?.description || '—',
    },
    focus: {
      label: texts.metaFocusLength,
      value: exif?.FocalLength?.description || '—',
    },
    FStop: {
      label: texts.metaFStop,
      value: exif?.FNumber?.description || '—',
    },
    exposure: {
      label: texts.metaExposure,
      value: exif?.ExposureTime?.description || '—',
    },
    ISO: {
      label: texts.metaISO,
      value: exif?.ISOSpeedRatings?.description || '—',
    },
    exposureBias: {
      label: texts.metaExposureBias,
      value: exif?.ExposureBiasValue?.description || '—',
    },
    flash: {
      label: texts.metaFlash,
      value: exif?.Flash?.description || '—',
    },
    colorSpace: {
      label: texts.metaColorSpace,
      value: exif?.ColorSpace?.description || '—',
    },
    dateTime: {
      label: texts.metaDateTime,
      value: exif?.DateTime?.description || '—',
    },
    copyright: {
      label: texts.metaImageCopyright,
      value: exif?.Copyright?.description || '—',
    },
  };
  return imageDate;
}

function getCorrectGPSLatitude(latitude, latitudeRef) {
  return latitudeRef.includes('South') ? -latitude : latitude;
}

function getCorrectGPSLongtitude(longitude, longitudeRef) {
  return longitudeRef.includes('West') ? -longitude : longitude;
}

function getFixedAltitude(altitude) {
  if (altitude) {
    const number = parseFloat(altitude);
    const fixedNumber = number.toFixed(2).replace('.', ',');
    return `${fixedNumber} m`;
  }
  return '—';
}

function getImageLocationData(advancedFile, texts) {
  const locationData = {
    lat: {
      label: texts?.metaLocationLatitude,
      value: getCorrectGPSLatitude(
        advancedFile.meta.exif.GPSLatitude.description,
        advancedFile.meta.exif.GPSLatitudeRef.description
      ),
    },
    long: {
      label: texts?.metaLocationLongitude,
      value: getCorrectGPSLongtitude(
        advancedFile.meta.exif.GPSLongitude.description,
        advancedFile.meta.exif.GPSLongitudeRef.description
      ),
    },
  };

  if (advancedFile.meta.exif.GPSAltitude) {
    locationData.altitude = {
      label: texts?.metaLocationAltitude,
      ref: advancedFile.meta.exif.GPSAltitudeRef.description,
      value: getFixedAltitude(advancedFile.meta.exif.GPSAltitude.description),
    };
  }

  return locationData;
}

function getAdditionalData(advancedFile) {
  const ret = {};
  function extractAndCleanData(metadata, dataType = 'other') {
    const result = {};
    Object.keys(metadata).forEach((key) => {
      let value;
      if (dataType === 'exif') {
        value = metadata[key]?.description;
      } else {
        value = metadata[key];
      }

      if (typeof value === 'number') {
        value = value.toString();
      }
      if (!value || /^(\s|\0)*$/.test(value)) {
        value = '—';
      } else {
        value = value
          .replace(/\0+/g, '')
          .trim()
          .replace(/\s{2,}/g, ' ');
      }
      result[key] = value;
    });
    return result;
  }
  // Handle exif data if it exists
  if (advancedFile.meta?.exif) {
    Object.assign(ret, extractAndCleanData(advancedFile.meta.exif, 'exif'));
  }
  // Handle officeMeta.app data if it exists
  if (advancedFile.meta?.officeMeta?.app) {
    Object.assign(ret, extractAndCleanData(advancedFile.meta.officeMeta.app));
  }

  return ret;
}

function getDefaultMainData(advancedFile, texts) {
  const format = getFileExtension(advancedFile?.name) || DASH;
  const size = convertBytesToFormattedString(advancedFile?.meta?.size) || DASH;
  const lastChanges = getFormatTime(advancedFile?.meta?.lastModified) || DASH;
  const mainData = {
    format: {
      label: texts.metaMainFormat,
      value: format,
    },
    size: {
      label: texts.metaMainDataSize,
      value: size,
    },
    lastChanges: {
      label: texts.metaMainLastModified,
      value: lastChanges,
    },
  };
  return mainData;
}

export function getDetails(advancedFile, base64String, texts) {
  if (!advancedFile || !advancedFile.meta) {
    return getDefaultMainData(advancedFile, texts);
  }

  const details = {};

  switch (true) {
    // If it's Image with exif data
    case Object.prototype.hasOwnProperty.call(advancedFile.meta, 'exif'):
      if (acceptedMimeImage(advancedFile.name)) {
        details.preview = base64String;
      }
      details.mainData = getImageMainData(advancedFile, texts);
      details.imageData = getImageData(advancedFile.meta.exif, texts);
      if (advancedFile.meta.exif.GPSLatitude && advancedFile.meta.exif.GPSLongitude) {
        details.locationData = getImageLocationData(advancedFile, texts);
      }
      details.additionalData = getAdditionalData(advancedFile);
      return details;

    // If it's a ZIP file
    case Object.prototype.hasOwnProperty.call(advancedFile.meta, 'archive'): {
      details.mainData = getDefaultMainData(advancedFile, texts);
      details.archiveContentData = getArchiveContentData(advancedFile.meta.archive);
      return details;
    }

    // If it's a Office file
    case Object.prototype.hasOwnProperty.call(advancedFile.meta, 'officeMeta'): {
      details.mainData = getOfficeFileMainData(advancedFile, texts);
      details.additionalData = getAdditionalData(advancedFile);
      return details;
    }

    default:
      details.mainData = getDefaultMainData(advancedFile, texts);
      return details;
  }
}
