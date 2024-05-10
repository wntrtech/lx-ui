import mime from 'mime';
import ExifReader from 'exifreader';
import { lxDateUtils } from '@/utils';

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

export function getMeta(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const meta = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };
    reader.onload = (e) => {
      try {
        // Add new meta... types here
        if (acceptedMimeImage(file.name)) {
          const exif = ExifReader.load(e.target.result);
          meta.exif = exif;
        }
        resolve(meta);
      } catch (error) {
        reject(error);
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

export function getExtraParameter(meta) {
  if (!meta) {
    return null;
  }
  // Add new extra parameter types here
  switch (true) {
    // If its Image with exif data
    case Object.prototype.hasOwnProperty.call(meta, 'exif'):
      return findExifHeightAndWidth(meta.exif);
    default:
      return null;
  }
}

export function getFileExtension(name) {
  return mime.getExtension(mime.getType(name)).toUpperCase();
}
export function convertBytesToFormattedString(bytes) {
  if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(2).replace('.', ',')} KiB`;
  }
  return `${(bytes / 1048576).toFixed(2).replace('.', ',')} MiB`;
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
    // If its Image with exif data
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
    default:
      details.mainData = getDefaultMainData(advancedFile, texts);
      return details;
  }
}
