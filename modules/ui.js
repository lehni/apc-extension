define(['exports', 'apc/auxiliary', 'apc/configuration'], (exports, auxiliary, configuration) => {
  const { traceError, store, services } = auxiliary;
  const { config } = configuration;

  try {
    const uri = require('vs/base/common/uri');

    function appendStyleElement() {
      const style = document.createElement('style');
      style.rel = 'stylesheet';
      const styleTextNode = document.createTextNode('');
      style.appendChild(styleTextNode);
      document.head.appendChild(style);
      return styleTextNode;
    }
    exports.appendStyleElement = appendStyleElement;

    function createDiv(classList) {
      const div = document.createElement('div');
      div.classList.add(classList);
      return div;
    }
    exports.createDiv = createDiv;

    function prependDiv(parent, classList = '') {
      const div = createDiv(classList);
      try { parent.prepend(div); }
      catch (error) { traceError(error); }
      return div;
    }
    exports.prependDiv = prependDiv;

    function appendDiv(parent, classList = '') {
      const div = createDiv(classList);
      try { parent.appendChild(div); }
      catch (error) { traceError(error); }
      return div;
    }
    exports.appendDiv = appendDiv;

    function updateClasses() {
      const listRowConfig = config.listRow;
      const headerConfig = config.header;
      const activityBarConfig = config.activityBar;
      const statusBarConfig = config.statusBar;
      const trafficLightPosition = config.electron.trafficLightPosition;
      const sidebarTitlebarConfig = config.titlebar;
      const { customFontFamily, customMonospaceFontFamily, ...fontFamilyParts } = config.fontFamily;

      const classList = document.body.classList;
      classList[statusBarConfig.position === 'top' ? 'add' : 'remove']('statusbar-top');
      classList[statusBarConfig.position === 'editor-top' ? 'add' : 'remove']('statusbar-editor-top');
      classList[activityBarConfig.position ? 'add' : 'remove']('horizontal-activitybar');
      classList[activityBarConfig.position === 'bottom' ? 'add' : 'remove']('activitybar-bottom');
      classList[activityBarConfig.position === 'top' ? 'add' : 'remove']('activitybar-top');
      classList[activityBarConfig.isEnabled ? 'add' : 'remove']('custom-activitybar');
      classList[headerConfig.isEnabled ? 'add' : 'remove']('custom-header');
      classList[sidebarTitlebarConfig.isEnabled ? 'add' : 'remove']('custom-sidebar-titlebar');
      classList[listRowConfig.isEnabled ? 'add' : 'remove']('custom-list-row');
      classList[statusBarConfig.isEnabled ? 'add' : 'remove']('custom-statusbar');
      // 
      classList[customFontFamily ? 'add' : 'remove']('custom-font-family');
      classList[customMonospaceFontFamily ? 'add' : 'remove']('custom-monospace-font');
      classList[fontFamilyParts.statusbar ? 'add' : 'remove']('custom-font-family-statusbar');
      classList[fontFamilyParts.panel ? 'add' : 'remove']('custom-font-family-panel');
      classList[fontFamilyParts['extension-editor'] ? 'add' : 'remove']('custom-font-family-extension-editor');
      classList[fontFamilyParts['settings-body'] ? 'add' : 'remove']('custom-font-family-settings-body');
      classList[fontFamilyParts.auxiliarybar ? 'add' : 'remove']('custom-font-family-auxiliarybar');
      classList[fontFamilyParts.tabs ? 'add' : 'remove']('custom-font-family-tabs');
      classList[fontFamilyParts.sidebar ? 'add' : 'remove']('custom-font-family-sidebar');
      classList[fontFamilyParts.titlebar ? 'add' : 'remove']('custom-font-family-titlebar');
      classList[fontFamilyParts.banner ? 'add' : 'remove']('custom-font-family-banner');
      classList[fontFamilyParts['monaco-menu'] ? 'add' : 'remove']('custom-font-family-monaco-menu');

      if (!store.rootTextNode) {
        store.rootTextNode = appendStyleElement();
      }

      store.rootTextNode.textContent = `:root {
        --row-height: ${listRowConfig.height}px; 
        --row-font-size: ${listRowConfig.fontSize}px;
        --header-height: ${headerConfig.height}px;
        --header-font-size: ${headerConfig.fontSize}px;
        --titlebar-height: ${sidebarTitlebarConfig.height}px;
        --titlebar-font-size: ${sidebarTitlebarConfig.fontSize}px;
        --activity-bar-action-size: ${activityBarConfig.size}px;
        --activity-bar-action-item-size: ${activityBarConfig.itemSize}px;
        --status-bar-font-size: ${statusBarConfig.fontSize}px;
        --traffic-X: ${trafficLightPosition.x}px;
        --custom-font-family: '${customFontFamily}';
        --custom-monospace-font: '${customMonospaceFontFamily}';
        --custom-font-family-statusbar: '${fontFamilyParts.statusbar}';
        --custom-font-family-panel: '${fontFamilyParts.panel}';
        --custom-font-family-extension-editor: '${fontFamilyParts['extension-editor']}';
        --custom-font-family-settings-body: '${fontFamilyParts['settings-body']}';
        --custom-font-family-auxiliarybar: '${fontFamilyParts.auxiliarybar}';
        --custom-font-family-tabs: '${fontFamilyParts.tabs}';
        --custom-font-family-sidebar: '${fontFamilyParts.sidebar}';
        --custom-font-family-titlebar: '${fontFamilyParts.titlebar}';
        --custom-font-family-banner: '${fontFamilyParts.banner}';
        --custom-font-family-monaco-menu: '${fontFamilyParts['monaco-menu']}';
        `;
    };
    exports.updateClasses = updateClasses;

    function generateStyleFomObject(obj, styles = '') {
      for (const property in obj) {
        const value = obj[property];
        if (['number', 'string'].includes(typeof value)) {
          styles += `${property}: ${value};\n`;
        }
      }
      return styles;
    }
    exports.generateStyleFomObject = generateStyleFomObject;

    function appendStyles() {
      if (!store.customStyleTextNode) { store.customStyleTextNode = appendStyleElement(); }

      const styleSheet = config.getConfiguration('apc.stylesheet');

      if (styleSheet instanceof Object) {
        store.customStyleTextNode.textContent = '';

        for (const selector in styleSheet) {
          const value = styleSheet[selector];
          const styles = typeof value === 'string' ? value : typeof value === 'object' ? generateStyleFomObject(value) : '';
          store.customStyleTextNode.textContent += `${selector} { ${styles} }\n`;
        }
      }
    }
    exports.appendStyles = appendStyles;

    function createExternal(type, config) {
      const element = document.createElement(type);
      for (const key in config) { element[key] = config[key]; }
      return element;
    }
    exports.createExternal = createExternal;

    function onDidFilesChange(event) {
      store.watchedFiles.size && [event.rawUpdated, event.rawAdded, event.rawDeleted].some(changes => changes.some(config => store.watchedFiles.has(config.path))) && appendFiles();
    }

    async function appendFiles() {
      try {
        const imports = config.getConfiguration('apc.imports');
        const paths = (imports instanceof Array ? imports : []);

        if (store.watchedFiles) {
          store.watchedFiles.forEach(file => file.dispose());
          store.watchedFiles.clear();
        }
        else {
          store.watchedFiles = new Map();
          config.disposables.add(services.fileService.onDidFilesChange(onDidFilesChange));
        }

        if (store.externalLinks) {
          store.externalLinks.forEach(el => document.head.removeChild(el));
          store.externalLinks.clear();
        }
        else { store.externalLinks = new Map(); }

        if (!store.customFileImports) { store.customFileImports = appendStyleElement(); }

        if (!store.customScriptImports) {
          store.customScriptImports = document.createElement('script');
          store.customScriptImports.type = 'text/javascript';
          document.head.appendChild(store.customScriptImports);
        }

        store.customFileImports.textContent = '';
        store.customScriptImports.textContent = '';

        for await (const path of paths) {
          try {
            if (typeof path === 'object') {
              const element = 'href' in path ? createExternal('link', path) : 'src' in path && createExternal('script', path);
              if (element) {
                store.externalLinks.set(path, element);
                document.head.appendChild(element);
              }
            }
            else if (typeof path === 'string' && path.match(/(\.css|\.js)$/)) {
              const URI = uri.URI.parse(!path.startsWith('file://') ? 'file://' + path : path);
              const data = await services.fileService.readFile(URI);
              const isCss = path.endsWith('.css');

              if (isCss) {
                const disposable = services.fileService.watch(URI);
                config.disposables.add(disposable);
                store.watchedFiles.set(URI.path, disposable);
              }
              const source = isCss ? store.customFileImports : store.customScriptImports;
              source.textContent = data?.value?.toString ? `${data.value.toString()}\n` : '';
            }
          } catch (err) {
            traceError(err);
          }
        }

      } catch (err) {
        traceError(err);
      }

    }
    exports.appendFiles = appendFiles;

    // !! backward compatibility
    async function restore() {
      try {
        const appRoot = services.environmentService.appRoot;
        const IFrameIndexPath = uri.URI.parse('file://' + appRoot + '/out/vs/workbench/contrib/webview/browser/pre/index.html');
        const IFrameIndexPathBkpPath = uri.URI.parse('file://' + appRoot + '/out/vs/workbench/contrib/webview/browser/pre/index.apc.bkp.html');
        const backup = await services.fileService.exists(IFrameIndexPathBkpPath);
        if (backup) {
          services.fileService.copy(IFrameIndexPathBkpPath, IFrameIndexPath);
        }
      } catch (error) {
        traceError(error);
      }
    }

    exports.run = function () {
      try {
        if (config.electron.titleBarStyle) { document.body.classList.add(`inline-title-bar`); }
        if (config.electron.frame === false) { document.body.classList.add(`frameless-title-bar`); }

        updateClasses();
        appendFiles();
        appendStyles();
        restore();

      } catch (error) { traceError(error); }
    };
  } catch (error) { traceError(error); }

});
