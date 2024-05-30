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

export function getMeta(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const meta = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      archive: [],
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
      const newFile = new File([e.target.result], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
      resolve({ base64Content, newFile });
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

    // Case when meta contain only "additionalInfo" param to show additional info
    case Object.prototype.hasOwnProperty.call(meta, 'additionalInfo'): {
      return meta.additionalInfo;
    }

    // Add new extra parameter types here
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
  if (!timeStomp) {
    return null;
  }
  return lxDateUtils.formatDateTime(new Date(timeStomp));
}

function stringToDate(dateString) {
  if (!dateString) {
    return null;
  }
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

function getAdditionaImageData(advancedFile) {
  const ret = {};
  Object.keys(advancedFile.meta.exif).forEach((key) => {
    let description = advancedFile.meta?.exif[key]?.description;
    if (typeof description === 'number') {
      description = description.toString();
    }
    if (!description || /^(\s|\0)*$/.test(description)) {
      description = '—';
    } else {
      description = description
        .replace(/\0+/g, '')
        .trim()
        .replace(/\s{2,}/g, ' ');
    }
    ret[key] = description;
  });
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
      details.additionalData = getAdditionaImageData(advancedFile);
      return details;
    // If it's a ZIP file
    case Object.prototype.hasOwnProperty.call(advancedFile.meta, 'archive'): {
      details.mainData = getDefaultMainData(advancedFile, texts);
      details.archiveContentData = getArchiveContentData(advancedFile.meta.archive);
      return details;
    }

    default:
      details.mainData = getDefaultMainData(advancedFile, texts);
      return details;
  }
}
