import mime from 'mime';
import useLx from '@/hooks/useLx';
import { formatFull, formatDateTime } from '@/utils/dateUtils';
import { log, logError } from '@/utils/devUtils';
import { getTexts } from '@/utils/visualPickerUtils';

const DASH = '—';

// Functions to dynamically load packages
async function loadX509() {
  try {
    const dynamicModule = await import('jsrsasign');

    if (dynamicModule.X509) {
      return dynamicModule.X509;
    }

    if (dynamicModule.default && dynamicModule.default.X509) {
      return dynamicModule.default.X509;
    }

    if (dynamicModule.jsrsasign && dynamicModule.jsrsasign.X509) {
      return dynamicModule.jsrsasign.X509;
    }
  } catch (error) {
    logError(`Failed to dynamically import jsrsasign:${error}`, useLx().getGlobals()?.environment);
  }

  throw new Error('Could not find X509 in jsrsasign module');
}

async function loadExifReader() {
  const ExifReader = await import('exifreader');
  return ExifReader;
}

async function loadJSZip() {
  const JSZip = await import('jszip');
  return JSZip;
}

async function loadPdfLib() {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = await import('pdfjs-dist/build/pdf.worker.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default;
  return pdfjs;
}

async function loadC2paComponents() {
  const { createC2pa } = await import('c2pa');
  const { selectProducer } = await import('c2pa');

  // eslint-disable-next-line import/no-unresolved
  const { default: wasmSrc } = await import('c2pa/dist/assets/wasm/toolkit_bg.wasm?url');
  // eslint-disable-next-line import/no-unresolved, import/extensions
  const { default: workerSrc } = await import('c2pa/dist/c2pa.worker.js?url');

  return { createC2pa, selectProducer, wasmSrc, workerSrc };
}

export function getFileExtension(name) {
  if (name.includes('.')) {
    const mimeType = mime.getType(name);

    if (mimeType) {
      const extension = mime.getExtension(mimeType);
      if (extension) {
        return extension.toUpperCase();
      }
    }
  }
  const parts = name.split('.');
  if (parts.length === 1 || parts[0] === '') {
    return log(
      `Cannot determine extension for file: ${name}`,
      useLx().getGlobals()?.environment,
      'error'
    );
  }
  return parts.pop().toUpperCase();
}

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

export function acceptedESignedDocument(name) {
  const fileExtension = name?.split('.').pop();
  const validMimeTypes = ['edoc', 'asice', 'sce'];
  return validMimeTypes.includes(fileExtension);
}

function isMacOsMetaFile(filename) {
  // Check if the file is a Mac-specific __MACOSX and ._  metadata file
  return filename.startsWith('__MACOSX') || filename.startsWith('._');
}

export function checkExtension(extension, allowedExtensions) {
  const mimeType = mime.getType(extension);

  // mime library cannot determine image/*, so we need to check it manually
  if (mimeType && mimeType.startsWith('image/') && allowedExtensions.includes('image/*')) {
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
        extension: getFileExtension(part),
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
      extension: file.extension,
    };
  });
}

function getEDocContentData(files) {
  if (!files) return [];
  const countries = getTexts('europe');

  return files.map((file) => ({
    id: file.signatureId,
    nameAndSurname: file.signerInfo?.nameAndSurname,
    organizationName: file.signerInfo?.organizationName,
    country: {
      name: countries[file.signerInfo?.countryName],
      code: file.signerInfo?.countryName,
    },
    personalCodeOrIdentifier: file.signerInfo?.personalCodeOrIdentifier,
    eSignIssuer: file.signerInfo?.eSignIssuer,
    eSignDate: file.signerInfo?.eSignDate,
    isAIGenerated: file.isAIGenerated || null,
    eSignFileType: file.signerInfo.eSignFileType,
    eSignType: file.signerInfo.eSignType,
  }));
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

function extractCertData(certString) {
  const map = {};
  const array = certString
    .slice(1)
    .split('/')
    .map((attr) => attr.split('='));

  array.forEach(([key, value]) => {
    map[key] = value;
  });
  return map;
}

async function extractSignerInfoFromCertificate(base64Cert, signingTimeValue, extension) {
  const pemCert = `-----BEGIN CERTIFICATE-----\n${base64Cert}\n-----END CERTIFICATE-----`;
  const X509 = await loadX509();
  const c = new X509();

  c.readCertPEM(pemCert);

  const subjectString = c.getSubjectString();
  const subjectObj = extractCertData(subjectString);
  const issuerString = c.getIssuerString();
  const issuerObj = extractCertData(issuerString);

  const { serialNumber, organizationIdentifier, CN, GN, SN, C } = subjectObj;
  const { O } = issuerObj;

  const cleanedPersonalCode = serialNumber?.split('PNOLV-').join('');
  const cleanedOrgIdentifier = organizationIdentifier?.split('NTRLV-').join('');

  const signerInfo = {
    nameAndSurname: serialNumber ? CN : null,
    organizationName: organizationIdentifier ? CN : null,
    name: GN || DASH,
    surname: SN || DASH,
    countryName: C || DASH,
    personalCodeOrIdentifier: cleanedPersonalCode || cleanedOrgIdentifier || DASH,
    eSignIssuer: O || DASH,
    eSignDate: formatFull(signingTimeValue) || DASH,
    eSignFileType: extension,
    eSignType: cleanedOrgIdentifier ? 'e-seal' : 'e-sign',
  };

  return signerInfo;
}

export async function extractC2paMetadata(arrayBuffer, fileType) {
  const aiToolList = [
    'Adobe Firefly',
    'DALL-E',
    'MidJourney',
    'Stable Diffusion',
    'RunwayML',
    'Bing Image Creator',
    'ChatGPT',
  ];

  const { createC2pa, selectProducer, wasmSrc, workerSrc } = await loadC2paComponents();

  const c2pa = await createC2pa({
    wasmSrc,
    workerSrc,
  });

  const c2paBlob = new Blob([arrayBuffer], { type: fileType });

  try {
    const { manifestStore } = await c2pa.read(c2paBlob);
    const activeManifest = manifestStore?.activeManifest;
    const assertionDataActions = activeManifest.assertions.get('c2pa.actions');

    let softwareAgent = null;

    if (assertionDataActions && assertionDataActions?.length > 0) {
      const { actions } = assertionDataActions[0].data;
      const softwareAgentAction = actions.find((action) => action.softwareAgent);
      if (softwareAgentAction) {
        softwareAgent = softwareAgentAction.softwareAgent;
      }
    }

    // Check if softwareAgent or if its not present claimGenerator name matches any AI tool name in the list
    const isAIGenerated =
      aiToolList.some((aiTool) => softwareAgent?.includes(aiTool)) ||
      aiToolList.some((aiTool) => activeManifest.claimGenerator.includes(aiTool));

    return {
      signatureId: activeManifest.signatureInfo?.cert_serial_number,
      isAIGenerated,
      signerInfo: {
        eSignType: 'c2pa',
        nameAndSurname: selectProducer(activeManifest)?.name, // producer
        eSignIssuer: activeManifest.signatureInfo?.issuer, // signatureIssuer
        eSignDate: activeManifest.signatureInfo?.time // signatureDate
          ? formatFull(activeManifest.signatureInfo?.time)
          : '',
      },
    };
  } catch (error) {
    return null;
  }
}

export async function getMeta(file, texts) {
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
        const acceptedImageTypes = acceptedMimeImage(file.name);
        const acceptedArchiveTypes = acceptedMimeArchive(file.name);
        const acceptedOfficeTypes = acceptedMimeOffice(file.name);
        const acceptedESginedDocs = acceptedESignedDocument(file.name);
        const acceptedPdfFile = file.type === 'application/pdf';

        // Handle image files with ExifReader
        if (acceptedImageTypes) {
          const ExifReader = await loadExifReader();
          const exif = ExifReader.load(arrayBuffer);
          meta.exif = exif;

          // Extract c2pa metadata
          const c2paMeta = await extractC2paMetadata(arrayBuffer, file.type);

          if (c2paMeta) {
            meta.eSignMeta = [c2paMeta];
            meta.c2paSigned = c2paMeta.signatureId;
            meta.createdUsingAi = c2paMeta.isAIGenerated;
          }
        }

        // Handle zip archive files
        if (acceptedArchiveTypes) {
          const JSZip = await loadJSZip();
          const zip = await JSZip.loadAsync(arrayBuffer);

          const promises = [];
          meta.archive = [];
          zip.forEach((_, zipEntry) => {
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
        if (acceptedOfficeTypes) {
          const JSZip = await loadJSZip();
          const zip = await JSZip.loadAsync(arrayBuffer);

          const coreXmlFile = zip.file('docProps/core.xml');
          const appXmlFile = zip.file('docProps/app.xml');

          const promises = [];
          meta.officeMeta = {};

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

        // Handle eSign files (edoc, asice)
        if (acceptedESginedDocs) {
          const JSZip = await loadJSZip();
          const zip = await JSZip.loadAsync(arrayBuffer);
          const extension = getFileExtension(file.name) || DASH;

          const promises = [];
          meta.eSignMeta = {};
          meta.eSigned = true;
          meta.eSignArchive = [];
          meta.additionalInfo = texts.metaAdditionalInfoeSigned;
          meta.signType = '';

          const allSignerInfos = [];

          zip.forEach((relativePath, zipEntry) => {
            if (
              (relativePath.startsWith('META-INF/edoc-signatures-S') &&
                relativePath.endsWith('.xml')) ||
              (relativePath.startsWith('META-INF/signatures') && relativePath.endsWith('.xml'))
            ) {
              const edicSignatureXmlContentPromise = zipEntry
                .async('string')
                .then(async (edicSignatureXmlContent) => {
                  const edicSignatureXml = parseXML(edicSignatureXmlContent);

                  const signatureId = relativePath.split('/').pop().replace('.xml', '');

                  meta.eSignMeta[signatureId] = {};

                  // Extract signer information from X.509 certificates
                  const x509CertElement =
                    edicSignatureXml.getElementsByTagName('ds:X509Certificate');
                  const base64Cert = x509CertElement[0].textContent;

                  // Extract sign time information from XAdES SigningTime element
                  const SigningTime = edicSignatureXml.getElementsByTagName('xades:SigningTime');
                  const signingTimeValue = SigningTime[0].textContent;

                  const signerInfo = await extractSignerInfoFromCertificate(
                    base64Cert,
                    signingTimeValue,
                    extension
                  );

                  allSignerInfos.push({
                    signatureId,
                    signerInfo,
                  });
                });

              promises.push(edicSignatureXmlContentPromise);
            } else if (!zipEntry.dir && !isMacOsMetaFile(zipEntry.name)) {
              const filePromise = zipEntry.async('arraybuffer').then((data) => {
                if (relativePath !== 'META-INF/manifest.xml' && relativePath !== 'mimetype') {
                  addFileToArchive(meta.eSignArchive, zipEntry, data.byteLength);
                }
              });

              promises.push(filePromise);
            }
          });

          await Promise.all(promises);
          meta.eSignMeta = allSignerInfos;
          meta.eSignArchive = getArchiveContentData(meta.eSignArchive);
        }

        // Handle PDF files
        if (acceptedPdfFile) {
          const pdfjs = await loadPdfLib();
          const uint8Array = new Uint8Array(arrayBuffer);

          meta.eSigned = false;
          meta.pdfMeta = {};
          meta.additionalInfo = '';

          const loadingTask = pdfjs.getDocument({ data: uint8Array });
          const pdf = await loadingTask.promise;

          // Extract metadata
          const metadata = await pdf.getMetadata();

          meta.eSigned = metadata.info?.IsSignaturesPresent;
          meta.pdfMeta = {
            title: metadata.info?.Title,
            author: metadata.info?.Author,
            subject: metadata.info?.Subject,
            keywords: metadata.info?.Keywords,
            creator: metadata.info?.Creator,
            producer: metadata.info?.Producer,
            created: metadata.info?.CreationDate,
            modified: metadata.info?.ModDate,
          };

          if (metadata.info?.IsSignaturesPresent) {
            meta.additionalInfo = texts.metaAdditionalInfoeSigned;
          }
        }
        // ADD NEW META TYPES HERE

        resolve(meta);
      } catch (error) {
        if (error.message === 'Encrypted zip are not supported') {
          reject(new Error('password-protected'));
        } else {
          reject(error instanceof Error ? error : new Error(error));
        }
      }
    };

    reader.onerror = (event) => {
      const errorMessage = event?.target?.error?.message || 'An unknown error occurred';
      reject(new Error(errorMessage));
    };
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
    reader.onerror = (event) => {
      const errorMessage = event?.target?.error?.message || 'An unknown error occurred';
      reject(new Error(errorMessage));
    };
    reader.readAsDataURL(file);
  });
}

function findExifHeightAndWidth(exif) {
  const width = exif?.['Image Width']?.value;
  const height = exif?.['Image Height']?.value;
  return width && height ? `${width} × ${height} px` : '';
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

function getFormatTime(timeStomp) {
  if (!timeStomp) return null;
  return formatDateTime(new Date(timeStomp));
}

function parsePdfDate(pdfDate) {
  if (!pdfDate) return null;
  const match = pdfDate.match(
    /^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})([+-Z])?(\d{2})?'?(\d{2})?'?$/
  );

  if (!match) return null; // Invalid date format

  const [, year, month, day, hours, minutes, seconds, tzSign, tzHours, tzMinutes] =
    match.map(Number);

  // Convert to UTC timestamp
  let date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  // Apply timezone offset if available
  if (tzSign && tzSign !== 'Z') {
    const offset = (tzHours * 60 + tzMinutes) * (tzSign === '+' ? -1 : 1);
    date = new Date(date.getTime() + offset * 60 * 1000);
  }

  return formatDateTime(new Date(date));
}

function stringToDate(dateString) {
  if (!dateString) return null;
  const formattedDateString = dateString.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const date = new Date(formattedDateString);
  return date.toLocaleString();
}

function getImageMainData(advancedFile, texts, additionalIconAndType) {
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
    additionalIconAndType,
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

function getPdfFileMainData(advancedFile, texts) {
  const authorString = advancedFile.meta?.pdfMeta?.author || null;
  const author = authorString
    ?.split(/[,;]/)
    .map((a) => a.trim())
    .filter(Boolean);

  const format = getFileExtension(advancedFile.name) || DASH;
  const size = convertBytesToFormattedString(advancedFile.meta.size) || DASH;
  const creationDate = parsePdfDate(advancedFile.meta?.pdfMeta?.created) || DASH;
  const lastChanges = parsePdfDate(advancedFile.meta?.pdfMeta?.modified) || DASH;
  const title = advancedFile.meta?.officeMeta?.title || DASH;
  const description = advancedFile.meta?.officeMeta?.description || DASH;

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

function getIconForExtension(extension) {
  switch (extension) {
    case 'DOC':
    case 'DOCX':
      return 'file-rich-text';
    case 'XLS':
    case 'XLSX':
      return 'file-spreadsheet';
    case 'ZIP':
    case 'RAR':
    case '7Z':
      return 'file-archive';
    case 'PNG':
    case 'JPG':
    case 'JPEG':
    case 'GIF':
    case 'SVG':
    case 'WEBP':
      return 'file-image';
    case 'PPTX':
      return 'file-slides';
    case 'EDOC':
      return 'file-edoc';
    case 'PDF':
      return 'file-pdf';
    default:
      return 'file';
  }
}

export function provideDefaultIcon(advancedFile) {
  if (!advancedFile) return 'file';

  if (typeof advancedFile === 'string') {
    const extension = getFileExtension(advancedFile);
    return getIconForExtension(extension);
  }
  if (typeof advancedFile === 'object') {
    const acceptedImageTypes = acceptedMimeImage(advancedFile.meta?.name);
    const acceptedArchiveTypes = acceptedMimeArchive(advancedFile.meta?.name);
    const acceptedOfficeTypes = acceptedMimeOffice(advancedFile.meta?.name);
    const acceptedESginedDocs = acceptedESignedDocument(advancedFile.meta?.name);
    const acceptedPdfFile = advancedFile.meta?.type === 'application/pdf';

    switch (true) {
      case acceptedImageTypes:
        return 'file-image';
      case acceptedArchiveTypes:
        return 'file-archive';
      case acceptedOfficeTypes && advancedFile.meta?.type?.endsWith('.presentation'):
        return 'file-slides';
      case acceptedOfficeTypes && advancedFile.meta?.type?.endsWith('.sheet'):
        return 'file-spreadsheet';
      case acceptedOfficeTypes && advancedFile.meta?.type?.endsWith('.document'):
        return 'file-rich-text';
      case acceptedESginedDocs:
        return 'file-edoc';
      case acceptedPdfFile:
        return 'file-pdf';
      default:
        return 'file';
    }
  }
  return 'file';
}

export function getDetails(advancedFile, base64String, texts, additionalIconAndType) {
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
      details.mainData = getImageMainData(advancedFile, texts, additionalIconAndType);
      details.edocContentData = getEDocContentData(advancedFile.meta.eSignMeta);
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

    // If it's a Edoc file
    case Object.prototype.hasOwnProperty.call(advancedFile.meta, 'eSignMeta'): {
      details.mainData = getDefaultMainData(advancedFile, texts);
      details.edocContentData = getEDocContentData(advancedFile.meta.eSignMeta);
      details.archiveContentData = getArchiveContentData(advancedFile.meta.eSignArchive);
      return details;
    }

    // If it's a PDF file
    case Object.prototype.hasOwnProperty.call(advancedFile.meta, 'pdfMeta'): {
      details.mainData = getPdfFileMainData(advancedFile, texts);
      return details;
    }

    default:
      details.mainData = getDefaultMainData(advancedFile, texts);
      return details;
  }
}
