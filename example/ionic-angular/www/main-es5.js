(function () {
  function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  (window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"], {
    /***/
    "../../dist/esm/backend.js":
    /*!*****************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/backend.js ***!
      \*****************************************************************************************/

    /*! exports provided: CapacitorBackend */

    /***/
    function distEsmBackendJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "CapacitorBackend", function () {
        return CapacitorBackend;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "../../node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _sentry_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @sentry/browser */
      "../../node_modules/@sentry/browser/esm/index.js");
      /* harmony import */


      var _sentry_browser_dist_backend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @sentry/browser/dist/backend */
      "../../node_modules/@sentry/browser/dist/backend.js");
      /* harmony import */


      var _sentry_browser_dist_backend__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_sentry_browser_dist_backend__WEBPACK_IMPORTED_MODULE_2__);
      /* harmony import */


      var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! @sentry/core */
      "../../node_modules/@sentry/core/esm/index.js");
      /* harmony import */


      var _sentry_types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
      /*! @sentry/types */
      "../../node_modules/@sentry/types/esm/index.js");
      /* harmony import */


      var _sentry_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
      /*! @sentry/utils */
      "../../node_modules/@sentry/utils/esm/index.js");
      /* harmony import */


      var _transports_native__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
      /*! ./transports/native */
      "../../dist/esm/transports/native.js");
      /* harmony import */


      var _wrapper__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(
      /*! ./wrapper */
      "../../dist/esm/wrapper.js");
      /**
       * The Sentry Capacitor SDK Backend.
       */


      var CapacitorBackend = /*#__PURE__*/function (_sentry_core__WEBPACK) {
        _inherits(CapacitorBackend, _sentry_core__WEBPACK);

        var _super = _createSuper(CapacitorBackend);

        /**
         * Creates a new Capacitor backend instance.
         */
        function CapacitorBackend(_options) {
          var _this;

          _classCallCheck(this, CapacitorBackend);

          _this = _super.call(this, _options);
          _this._options = _options;
          _this._browserBackend = new _sentry_browser_dist_backend__WEBPACK_IMPORTED_MODULE_2__["BrowserBackend"](_options);
          void _this._startWithOptions();
          return _this;
        }
        /**
         * If native client is available it will trigger a native crash.
         * Use this only for testing purposes.
         */


        _createClass(CapacitorBackend, [{
          key: "nativeCrash",
          value: function nativeCrash() {
            if (this._options.enableNative) {
              _wrapper__WEBPACK_IMPORTED_MODULE_7__["NATIVE"].crash();
            }
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "eventFromException",
          value: function eventFromException(exception, hint) {
            return this._browserBackend.eventFromException(exception, hint);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "eventFromMessage",
          value: function eventFromMessage(message) {
            var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _sentry_types__WEBPACK_IMPORTED_MODULE_4__["Severity"].Info;
            var hint = arguments.length > 2 ? arguments[2] : undefined;

            /* eslint-disable no-console */
            return this._browserBackend.eventFromMessage(message, level, hint);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "_setupTransport",
          value: function _setupTransport() {
            if (!this._options.dsn) {
              // We return the noop transport here in case there is no Dsn.
              return new _sentry_core__WEBPACK_IMPORTED_MODULE_3__["NoopTransport"]();
            }

            var transportOptions = Object.assign(Object.assign({}, this._options.transportOptions), {
              dsn: this._options.dsn
            });

            if (this._options.transport) {
              return new this._options.transport(transportOptions);
            }

            if (this._isNativeClientAvailable()) {
              return new _transports_native__WEBPACK_IMPORTED_MODULE_6__["NativeTransport"]();
            }

            return new _sentry_browser__WEBPACK_IMPORTED_MODULE_1__["Transports"].FetchTransport(transportOptions);
          }
          /**
           * If true, native client is availabe and active
           */

        }, {
          key: "_isNativeClientAvailable",
          value: function _isNativeClientAvailable() {
            return this._options.enableNative === true && _wrapper__WEBPACK_IMPORTED_MODULE_7__["NATIVE"].isNativeClientAvailable();
          }
          /**
           * Starts native client with dsn and options
           */

        }, {
          key: "_startWithOptions",
          value: function _startWithOptions() {
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return _wrapper__WEBPACK_IMPORTED_MODULE_7__["NATIVE"].startWithOptions(this._options);

                    case 3:
                      _wrapper__WEBPACK_IMPORTED_MODULE_7__["NATIVE"].setLogLevel(this._options.debug ? 2 : 1);

                      _context.next = 9;
                      break;

                    case 6:
                      _context.prev = 6;
                      _context.t0 = _context["catch"](0);

                      _sentry_utils__WEBPACK_IMPORTED_MODULE_5__["logger"].error(_context.t0);

                    case 9:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee, this, [[0, 6]]);
            }));
          }
        }]);

        return CapacitorBackend;
      }(_sentry_core__WEBPACK_IMPORTED_MODULE_3__["BaseBackend"]); //# sourceMappingURL=backend.js.map

      /***/

    },

    /***/
    "../../dist/esm/client.js":
    /*!****************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/client.js ***!
      \****************************************************************************************/

    /*! exports provided: CapacitorClient */

    /***/
    function distEsmClientJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "CapacitorClient", function () {
        return CapacitorClient;
      });
      /* harmony import */


      var _sentry_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! @sentry/core */
      "../../node_modules/@sentry/core/esm/index.js");
      /* harmony import */


      var _backend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! ./backend */
      "../../dist/esm/backend.js");
      /**
       * The Sentry Capacitor SDK Client.
       */


      var CapacitorClient = /*#__PURE__*/function (_sentry_core__WEBPACK2) {
        _inherits(CapacitorClient, _sentry_core__WEBPACK2);

        var _super2 = _createSuper(CapacitorClient);

        /**
         * Creates a new Capacitor SDK instance.
         * @params options Configuration options for this SDK.
         */
        function CapacitorClient(options) {
          _classCallCheck(this, CapacitorClient);

          return _super2.call(this, _backend__WEBPACK_IMPORTED_MODULE_1__["CapacitorBackend"], options);
        }
        /**
         * If native client is available it will trigger a native crash.
         * Use this only for testing purposes.
         */


        _createClass(CapacitorClient, [{
          key: "nativeCrash",
          value: function nativeCrash() {
            this._getBackend().nativeCrash();
          }
        }]);

        return CapacitorClient;
      }(_sentry_core__WEBPACK_IMPORTED_MODULE_0__["BaseClient"]); //# sourceMappingURL=client.js.map

      /***/

    },

    /***/
    "../../dist/esm/definitions.js":
    /*!*********************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/definitions.js ***!
      \*********************************************************************************************/

    /*! no exports provided */

    /***/
    function distEsmDefinitionsJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__); //# sourceMappingURL=definitions.js.map

      /***/

    },

    /***/
    "../../dist/esm/index.js":
    /*!***************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/index.js ***!
      \***************************************************************************************/

    /*! exports provided: SentryCapacitorWeb, SentryCapacitor, Severity, Status, addGlobalEventProcessor, addBreadcrumb, captureException, captureEvent, captureMessage, configureScope, getHubFromCarrier, getCurrentHub, Hub, Scope, setContext, setExtra, setExtras, setTag, setTags, setUser, withScope, CapacitorBackend, CapacitorClient, init, nativeCrash, Integrations, SDK_NAME, SDK_VERSION */

    /***/
    function distEsmIndexJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony import */


      var _definitions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! ./definitions */
      "../../dist/esm/definitions.js");
      /* empty/unused harmony star reexport */

      /* harmony import */


      var _web__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! ./web */
      "../../dist/esm/web.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "SentryCapacitorWeb", function () {
        return _web__WEBPACK_IMPORTED_MODULE_1__["SentryCapacitorWeb"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "SentryCapacitor", function () {
        return _web__WEBPACK_IMPORTED_MODULE_1__["SentryCapacitor"];
      });
      /* harmony import */


      var _sentry_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @sentry/types */
      "../../node_modules/@sentry/types/esm/index.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "Severity", function () {
        return _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Severity"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "Status", function () {
        return _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Status"];
      });
      /* harmony import */


      var _sentry_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! @sentry/core */
      "../../node_modules/@sentry/core/esm/index.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "addGlobalEventProcessor", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["addGlobalEventProcessor"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "addBreadcrumb", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["addBreadcrumb"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "captureException", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["captureException"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "captureEvent", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["captureEvent"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "captureMessage", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["captureMessage"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "configureScope", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["configureScope"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "getHubFromCarrier", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["getHubFromCarrier"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "getCurrentHub", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["getCurrentHub"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "Hub", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["Hub"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "Scope", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["Scope"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "setContext", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["setContext"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "setExtra", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["setExtra"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "setExtras", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["setExtras"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "setTag", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["setTag"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "setTags", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["setTags"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "setUser", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["setUser"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "withScope", function () {
        return _sentry_core__WEBPACK_IMPORTED_MODULE_3__["withScope"];
      });
      /* harmony import */


      var _integrations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
      /*! ./integrations */
      "../../dist/esm/integrations/index.js");
      /* harmony reexport (module object) */


      __webpack_require__.d(__webpack_exports__, "Integrations", function () {
        return _integrations__WEBPACK_IMPORTED_MODULE_4__;
      });
      /* harmony import */


      var _version__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
      /*! ./version */
      "../../dist/esm/version.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "SDK_NAME", function () {
        return _version__WEBPACK_IMPORTED_MODULE_5__["SDK_NAME"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "SDK_VERSION", function () {
        return _version__WEBPACK_IMPORTED_MODULE_5__["SDK_VERSION"];
      });
      /* harmony import */


      var _backend__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
      /*! ./backend */
      "../../dist/esm/backend.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "CapacitorBackend", function () {
        return _backend__WEBPACK_IMPORTED_MODULE_6__["CapacitorBackend"];
      });
      /* harmony import */


      var _client__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(
      /*! ./client */
      "../../dist/esm/client.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "CapacitorClient", function () {
        return _client__WEBPACK_IMPORTED_MODULE_7__["CapacitorClient"];
      });
      /* harmony import */


      var _sdk__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(
      /*! ./sdk */
      "../../dist/esm/sdk.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "init", function () {
        return _sdk__WEBPACK_IMPORTED_MODULE_8__["init"];
      });
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "nativeCrash", function () {
        return _sdk__WEBPACK_IMPORTED_MODULE_8__["nativeCrash"];
      });
      /**
       * Adds the SDK info. Make sure this is called after @sentry/capacitor's so this is the top-level SDK.
       */


      function createCapacitorEventProcessor() {
        if (_sentry_core__WEBPACK_IMPORTED_MODULE_3__["addGlobalEventProcessor"]) {
          Object(_sentry_core__WEBPACK_IMPORTED_MODULE_3__["addGlobalEventProcessor"])(function (event) {
            event.platform = event.platform || 'javascript';
            event.sdk = Object.assign(Object.assign({}, event.sdk), {
              name: _version__WEBPACK_IMPORTED_MODULE_5__["SDK_NAME"],
              packages: [].concat(_toConsumableArray(event.sdk && event.sdk.packages || []), [{
                name: 'npm:@sentry/capacitor',
                version: _version__WEBPACK_IMPORTED_MODULE_5__["SDK_VERSION"]
              }]),
              version: _version__WEBPACK_IMPORTED_MODULE_5__["SDK_VERSION"]
            });
            return event;
          });
        }
      }

      createCapacitorEventProcessor(); //# sourceMappingURL=index.js.map

      /***/
    },

    /***/
    "../../dist/esm/integrations/index.js":
    /*!****************************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/integrations/index.js ***!
      \****************************************************************************************************/

    /*! exports provided: Release */

    /***/
    function distEsmIntegrationsIndexJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony import */


      var _release__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! ./release */
      "../../dist/esm/integrations/release.js");
      /* harmony reexport (safe) */


      __webpack_require__.d(__webpack_exports__, "Release", function () {
        return _release__WEBPACK_IMPORTED_MODULE_0__["Release"];
      }); //# sourceMappingURL=index.js.map

      /***/

    },

    /***/
    "../../dist/esm/integrations/release.js":
    /*!******************************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/integrations/release.js ***!
      \******************************************************************************************************/

    /*! exports provided: Release */

    /***/
    function distEsmIntegrationsReleaseJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "Release", function () {
        return Release;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "../../node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @sentry/core */
      "../../node_modules/@sentry/core/esm/index.js");
      /* harmony import */


      var _wrapper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! ../wrapper */
      "../../dist/esm/wrapper.js");
      /**
       * Release integration responsible for loading release from file.
       */


      var Release = /*#__PURE__*/function () {
        function Release() {
          _classCallCheck(this, Release);

          /**
           * @inheritDoc
           */
          this.name = Release.id;
        }
        /**
         * @inheritDoc
         */


        _createClass(Release, [{
          key: "setupOnce",
          value: function setupOnce() {
            var _this2 = this;

            Object(_sentry_core__WEBPACK_IMPORTED_MODULE_1__["addGlobalEventProcessor"])(function (event) {
              return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(_this2, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var _a, _b, _c, self, release, options;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        self = Object(_sentry_core__WEBPACK_IMPORTED_MODULE_1__["getCurrentHub"])().getIntegration(Release);

                        if (self) {
                          _context2.next = 3;
                          break;
                        }

                        return _context2.abrupt("return", event);

                      case 3:
                        _context2.prev = 3;
                        _context2.next = 6;
                        return _wrapper__WEBPACK_IMPORTED_MODULE_2__["NATIVE"].fetchRelease();

                      case 6:
                        release = _context2.sent;

                        if (release) {
                          event.release = "".concat(release.id, "@").concat(release.version, "+").concat(release.build);
                          event.dist = "".concat(release.build);
                        }

                        _context2.next = 12;
                        break;

                      case 10:
                        _context2.prev = 10;
                        _context2.t0 = _context2["catch"](3);

                      case 12:
                        options = (_a = Object(_sentry_core__WEBPACK_IMPORTED_MODULE_1__["getCurrentHub"])().getClient()) === null || _a === void 0 ? void 0 : _a.getOptions();
                        /*
                          __sentry_release and __sentry_dist is set by the user with setRelease and setDist. If this is used then this is the strongest.
                          Otherwise we check for the release and dist in the options passed on init, as this is stronger than the release/dist from the native build.
                        */

                        if (typeof ((_b = event.extra) === null || _b === void 0 ? void 0 : _b.__sentry_release) === 'string') {
                          event.release = "".concat(event.extra.__sentry_release);
                        } else if (typeof (options === null || options === void 0 ? void 0 : options.release) === 'string') {
                          event.release = options.release;
                        }

                        if (typeof ((_c = event.extra) === null || _c === void 0 ? void 0 : _c.__sentry_dist) === 'string') {
                          event.dist = "".concat(event.extra.__sentry_dist);
                        } else if (typeof (options === null || options === void 0 ? void 0 : options.dist) === 'string') {
                          event.dist = options.dist;
                        }

                        return _context2.abrupt("return", event);

                      case 16:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, null, [[3, 10]]);
              }));
            });
          }
        }]);

        return Release;
      }();
      /**
       * @inheritDoc
       */


      Release.id = 'Release'; //# sourceMappingURL=release.js.map

      /***/
    },

    /***/
    "../../dist/esm/scope.js":
    /*!***************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/scope.js ***!
      \***************************************************************************************/

    /*! exports provided: CapacitorScope */

    /***/
    function distEsmScopeJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "CapacitorScope", function () {
        return CapacitorScope;
      });
      /* harmony import */


      var _sentry_hub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! @sentry/hub */
      "../../node_modules/@sentry/hub/esm/index.js");
      /* harmony import */


      var _wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! ./wrapper */
      "../../dist/esm/wrapper.js");
      /**
       * Extends the scope methods to set scope on the Native SDKs
       */


      var CapacitorScope = /*#__PURE__*/function (_sentry_hub__WEBPACK_) {
        _inherits(CapacitorScope, _sentry_hub__WEBPACK_);

        var _super3 = _createSuper(CapacitorScope);

        function CapacitorScope() {
          _classCallCheck(this, CapacitorScope);

          return _super3.apply(this, arguments);
        }

        _createClass(CapacitorScope, [{
          key: "setUser",

          /**
           * @inheritDoc
           */
          value: function setUser(user) {
            _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].setUser(user);

            return _get(_getPrototypeOf(CapacitorScope.prototype), "setUser", this).call(this, user);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "setTag",
          value: function setTag(key, value) {
            /* eslint-disable no-console */
            _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].setTag(key, value);

            return _get(_getPrototypeOf(CapacitorScope.prototype), "setTag", this).call(this, key, value);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "setTags",
          value: function setTags(tags) {
            /* eslint-disable no-console */
            // As native only has setTag, we just loop through each tag key.
            Object.keys(tags).forEach(function (key) {
              _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].setTag(key, tags[key]);
            });
            return _get(_getPrototypeOf(CapacitorScope.prototype), "setTags", this).call(this, tags);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "setExtras",
          value: function setExtras(extras) {
            Object.keys(extras).forEach(function (key) {
              _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].setExtra(key, extras[key]);
            });
            return _get(_getPrototypeOf(CapacitorScope.prototype), "setExtras", this).call(this, extras);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "setExtra",
          value: function setExtra(key, extra) {
            _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].setExtra(key, extra);

            return _get(_getPrototypeOf(CapacitorScope.prototype), "setExtra", this).call(this, key, extra);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "addBreadcrumb",
          value: function addBreadcrumb(breadcrumb, maxBreadcrumbs) {
            /* eslint-disable no-console */
            _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].addBreadcrumb(breadcrumb);

            return _get(_getPrototypeOf(CapacitorScope.prototype), "addBreadcrumb", this).call(this, breadcrumb, maxBreadcrumbs);
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "clearBreadcrumbs",
          value: function clearBreadcrumbs() {
            _wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].clearBreadcrumbs();

            return _get(_getPrototypeOf(CapacitorScope.prototype), "clearBreadcrumbs", this).call(this);
          }
        }]);

        return CapacitorScope;
      }(_sentry_hub__WEBPACK_IMPORTED_MODULE_0__["Scope"]); //# sourceMappingURL=scope.js.map

      /***/

    },

    /***/
    "../../dist/esm/sdk.js":
    /*!*************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/sdk.js ***!
      \*************************************************************************************/

    /*! exports provided: init, nativeCrash */

    /***/
    function distEsmSdkJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "init", function () {
        return init;
      });
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "nativeCrash", function () {
        return nativeCrash;
      });
      /* harmony import */


      var _sentry_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! @sentry/browser */
      "../../node_modules/@sentry/browser/esm/index.js");
      /* harmony import */


      var _sentry_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @sentry/core */
      "../../node_modules/@sentry/core/esm/index.js");
      /* harmony import */


      var _sentry_hub__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @sentry/hub */
      "../../node_modules/@sentry/hub/esm/index.js");
      /* harmony import */


      var _sentry_integrations__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! @sentry/integrations */
      "../../node_modules/@sentry/integrations/esm/index.js");
      /* harmony import */


      var _client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
      /*! ./client */
      "../../dist/esm/client.js");
      /* harmony import */


      var _integrations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
      /*! ./integrations */
      "../../dist/esm/integrations/index.js");
      /* harmony import */


      var _scope__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
      /*! ./scope */
      "../../dist/esm/scope.js");

      var DEFAULT_OPTIONS = {
        enableNative: true,
        enableNativeNagger: true
      };
      /**
       * Inits the SDK
       */

      function init() {
        var passedOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
          enableNative: true,
          enableNativeNagger: true
        };

        /* eslint-disable no-console */
        var capacitorHub = new _sentry_hub__WEBPACK_IMPORTED_MODULE_2__["Hub"](undefined, new _scope__WEBPACK_IMPORTED_MODULE_6__["CapacitorScope"]());
        Object(_sentry_hub__WEBPACK_IMPORTED_MODULE_2__["makeMain"])(capacitorHub);
        var options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), passedOptions);

        if (options.defaultIntegrations === undefined) {
          options.defaultIntegrations = [new _integrations__WEBPACK_IMPORTED_MODULE_5__["Release"]()].concat(_toConsumableArray(_sentry_browser__WEBPACK_IMPORTED_MODULE_0__["defaultIntegrations"]));
          options.defaultIntegrations.push(new _sentry_integrations__WEBPACK_IMPORTED_MODULE_3__["RewriteFrames"]({
            iteratee: function iteratee(frame) {
              if (frame.filename) {
                frame.filename = frame.filename.replace(/^file:\/\//, '').replace(/^address at /, '').replace(/^.*\/[^.]+(\.app|CodePush|.*(?=\/))/, '');

                if (frame.filename !== '[native code]' && frame.filename !== 'native') {
                  var appPrefix = 'app://'; // We always want to have a triple slash

                  frame.filename = frame.filename.indexOf('/') === 0 ? "".concat(appPrefix).concat(frame.filename) : "".concat(appPrefix, "/").concat(frame.filename);
                }
              }

              return frame;
            }
          }));
        }

        Object(_sentry_core__WEBPACK_IMPORTED_MODULE_1__["initAndBind"])(_client__WEBPACK_IMPORTED_MODULE_4__["CapacitorClient"], options); // set the event.origin tag.

        Object(_sentry_hub__WEBPACK_IMPORTED_MODULE_2__["getCurrentHub"])().setTag('event.origin', 'javascript');
      }
      /**
       * If native client is available it will trigger a native crash
       * Use this only for testing purposes
       */


      function nativeCrash() {
        var client = Object(_sentry_hub__WEBPACK_IMPORTED_MODULE_2__["getCurrentHub"])().getClient();

        if (client) {
          client.nativeCrash();
        }
      } //# sourceMappingURL=sdk.js.map

      /***/

    },

    /***/
    "../../dist/esm/transports/native.js":
    /*!***************************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/transports/native.js ***!
      \***************************************************************************************************/

    /*! exports provided: NativeTransport */

    /***/
    function distEsmTransportsNativeJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "NativeTransport", function () {
        return NativeTransport;
      });
      /* harmony import */


      var _sentry_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! @sentry/utils */
      "../../node_modules/@sentry/utils/esm/index.js");
      /* harmony import */


      var _wrapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! ../wrapper */
      "../../dist/esm/wrapper.js");
      /** Native Transport class implementation */


      var NativeTransport = /*#__PURE__*/function () {
        function NativeTransport() {
          _classCallCheck(this, NativeTransport);

          /** A simple buffer holding all requests. */
          this._buffer = new _sentry_utils__WEBPACK_IMPORTED_MODULE_0__["PromiseBuffer"](30);
        }
        /**
         * @inheritDoc
         */


        _createClass(NativeTransport, [{
          key: "sendEvent",
          value: function sendEvent(event) {
            if (!this._buffer.isReady()) {
              return Promise.reject(new _sentry_utils__WEBPACK_IMPORTED_MODULE_0__["SentryError"]('Not adding Promise due to buffer limit reached.'));
            }

            return this._buffer.add(_wrapper__WEBPACK_IMPORTED_MODULE_1__["NATIVE"].sendEvent(event));
          }
          /**
           * @inheritDoc
           */

        }, {
          key: "close",
          value: function close(timeout) {
            return this._buffer.drain(timeout);
          }
        }]);

        return NativeTransport;
      }(); //# sourceMappingURL=native.js.map

      /***/

    },

    /***/
    "../../dist/esm/version.js":
    /*!*****************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/version.js ***!
      \*****************************************************************************************/

    /*! exports provided: SDK_NAME, SDK_VERSION */

    /***/
    function distEsmVersionJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "SDK_NAME", function () {
        return SDK_NAME;
      });
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "SDK_VERSION", function () {
        return SDK_VERSION;
      });

      var SDK_NAME = 'sentry.javascript.capacitor';
      var SDK_VERSION = '0.0.1'; //# sourceMappingURL=version.js.map

      /***/
    },

    /***/
    "../../dist/esm/web.js":
    /*!*************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/web.js ***!
      \*************************************************************************************/

    /*! exports provided: SentryCapacitorWeb, SentryCapacitor */

    /***/
    function distEsmWebJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "SentryCapacitorWeb", function () {
        return SentryCapacitorWeb;
      });
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "SentryCapacitor", function () {
        return SentryCapacitor;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "../../node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _capacitor_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @capacitor/core */
      "../../node_modules/@capacitor/core/dist/esm/index.js");
      /* harmony import */


      var _sentry_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @sentry/types */
      "../../node_modules/@sentry/types/esm/index.js");
      /**
       *
       */


      var SentryCapacitorWeb = /*#__PURE__*/function (_capacitor_core__WEBP) {
        _inherits(SentryCapacitorWeb, _capacitor_core__WEBP);

        var _super4 = _createSuper(SentryCapacitorWeb);

        function SentryCapacitorWeb() {
          _classCallCheck(this, SentryCapacitorWeb);

          return _super4.call(this, {
            name: 'SentryCapacitor',
            platforms: ['web']
          });
        }
        /**
         *
         */


        _createClass(SentryCapacitorWeb, [{
          key: "addBreadcrumb",
          value: function addBreadcrumb() {// TODO integrate web
          }
          /**
           *
           */

        }, {
          key: "captureEnvelope",
          value: function captureEnvelope(payload) {
            // TODO integrate web

            /* eslint-disable-next-line */
            console.log('payload: ', payload);
            return Promise.resolve({
              status: _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Status"].Success
            });
          }
          /**
           *
           */

        }, {
          key: "clearBreadcrumbs",
          value: function clearBreadcrumbs() {// TODO integrate web
          }
          /**
           *
           */

        }, {
          key: "crash",
          value: function crash() {// TODO integrate web
          }
          /**
           *
           */

        }, {
          key: "fetchRelease",
          value: function fetchRelease() {
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      return _context3.abrupt("return", {
                        build: 'somebuild',
                        id: 'someid',
                        version: 'someversion'
                      });

                    case 1:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3);
            }));
          }
          /**
           *
           */

        }, {
          key: "getStringBytesLength",
          value: function getStringBytesLength(payload) {
            // TODO integrate web

            /* eslint-disable-next-line */
            console.log('payload: ', payload);
            return Promise.resolve({
              value: 12
            });
          }
          /**
           *
           */

        }, {
          key: "startWithOptions",
          value: function startWithOptions(options) {
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      // TODO integrate web

                      /* eslint-disable-next-line */
                      console.log('options: ', options);
                      return _context4.abrupt("return", true);

                    case 2:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4);
            }));
          }
          /**
           *
           */

        }, {
          key: "setUser",
          value: function setUser() {// TODO integrate web
          }
          /**
           *
           */

        }, {
          key: "setTag",
          value: function setTag() {// TODO integrate web
          }
          /**
           *
           */

        }, {
          key: "setExtra",
          value: function setExtra() {// TODO integrate web
          }
          /**
           *
           */

        }, {
          key: "setLogLevel",
          value: function setLogLevel() {// TODO integrate web
          }
        }]);

        return SentryCapacitorWeb;
      }(_capacitor_core__WEBPACK_IMPORTED_MODULE_1__["WebPlugin"]);

      var SentryCapacitor = new SentryCapacitorWeb();
      Object(_capacitor_core__WEBPACK_IMPORTED_MODULE_1__["registerWebPlugin"])(SentryCapacitor); //# sourceMappingURL=web.js.map

      /***/
    },

    /***/
    "../../dist/esm/wrapper.js":
    /*!*****************************************************************************************!*\
      !*** /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/dist/esm/wrapper.js ***!
      \*****************************************************************************************/

    /*! exports provided: NATIVE */

    /***/
    function distEsmWrapperJs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "NATIVE", function () {
        return NATIVE;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "../../node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _capacitor_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @capacitor/core */
      "../../node_modules/@capacitor/core/dist/esm/index.js");
      /* harmony import */


      var _sentry_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @sentry/types */
      "../../node_modules/@sentry/types/esm/index.js");
      /* harmony import */


      var _sentry_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! @sentry/utils */
      "../../node_modules/@sentry/utils/esm/index.js");
      /* eslint-disable max-lines */


      var SentryCapacitor = _capacitor_core__WEBPACK_IMPORTED_MODULE_1__["Plugins"].SentryCapacitor;
      /**
       * Internal interface for calling native functions
       */

      var NATIVE = {
        /**
         * Sending the event over the bridge to native
         * @param event Event
         */
        sendEvent: function sendEvent(event) {
          var _a;

          return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
            var header, payload, headerString, payloadString, length, item, itemString, envelopeString;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    if (this.enableNative) {
                      _context5.next = 2;
                      break;
                    }

                    throw this._DisabledNativeError;

                  case 2:
                    if (this.isNativeClientAvailable()) {
                      _context5.next = 4;
                      break;
                    }

                    throw this._NativeClientError;

                  case 4:
                    // Process and convert deprecated levels
                    event.level = event.level ? this._processLevel(event.level) : undefined;
                    header = {
                      event_id: event.event_id,
                      sdk: event.sdk
                    };
                    payload = Object.assign(Object.assign({}, event), {
                      type: (_a = event.type) !== null && _a !== void 0 ? _a : 'event',
                      message: {
                        message: event.message
                      }
                    });
                    headerString = JSON.stringify(header);
                    payloadString = JSON.stringify(payload);
                    length = payloadString.length;

                    try {
                      void SentryCapacitor.getStringBytesLength({
                        string: payloadString
                      }).then(function (resp) {
                        length = resp.value;
                      });
                    } catch (_b) {// The native call failed, we do nothing, we have payload.length as a fallback
                    }

                    item = {
                      content_type: 'application/json',
                      length: length,
                      type: payload.type
                    };
                    itemString = JSON.stringify(item);
                    envelopeString = "".concat(headerString, "\n").concat(itemString, "\n").concat(payloadString);
                    return _context5.abrupt("return", SentryCapacitor.captureEnvelope({
                      envelope: envelopeString
                    }));

                  case 15:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5, this);
          }));
        },

        /**
         * Starts native with the provided options
         * @param options CapacitorOptions
         */
        startWithOptions: function startWithOptions() {
          var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
            enableNative: true
          };
          return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
            var beforeSend, beforeBreadcrumb, integrations, defaultIntegrations, transport, filteredOptions;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    if (options.dsn) {
                      _context6.next = 3;
                      break;
                    }

                    _sentry_utils__WEBPACK_IMPORTED_MODULE_3__["logger"].warn('Warning: No DSN was provided. The Sentry SDK will be disabled. Native SDK will also not be initalized.');

                    return _context6.abrupt("return", false);

                  case 3:
                    if (options.enableNative) {
                      _context6.next = 7;
                      break;
                    }

                    if (options.enableNativeNagger) {
                      _sentry_utils__WEBPACK_IMPORTED_MODULE_3__["logger"].warn('Note: Native Sentry SDK is disabled.');
                    }

                    this.enableNative = false;
                    return _context6.abrupt("return", false);

                  case 7:
                    if (this.isNativeClientAvailable()) {
                      _context6.next = 9;
                      break;
                    }

                    throw this._NativeClientError;

                  case 9:
                    // filter out all options that would crash native

                    /* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unused-vars */
                    beforeSend = options.beforeSend, beforeBreadcrumb = options.beforeBreadcrumb, integrations = options.integrations, defaultIntegrations = options.defaultIntegrations, transport = options.transport, filteredOptions = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"])(options, ["beforeSend", "beforeBreadcrumb", "integrations", "defaultIntegrations", "transport"]);
                    return _context6.abrupt("return", SentryCapacitor.startWithOptions(filteredOptions));

                  case 11:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6, this);
          }));
        },

        /**
         * Fetches the release from native
         */
        fetchRelease: function fetchRelease() {
          return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    if (this.enableNative) {
                      _context7.next = 2;
                      break;
                    }

                    throw this._DisabledNativeError;

                  case 2:
                    return _context7.abrupt("return", SentryCapacitor.fetchRelease());

                  case 3:
                  case "end":
                    return _context7.stop();
                }
              }
            }, _callee7, this);
          }));
        },

        /**
         * Sets log level in native
         * @param level number
         */
        setLogLevel: function setLogLevel(level) {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          }

          SentryCapacitor.setLogLevel(level);
        },

        /**
         * Triggers a native crash.
         * Use this only for testing purposes.
         */
        crash: function crash() {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          }

          SentryCapacitor.crash();
        },

        /**
         * Sets the user in the native scope.
         * Passing null clears the user.
         * @param key string
         * @param value string
         */
        setUser: function setUser(user) {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          } // separate and serialze all non-default user keys.


          var defaultUserKeys = null;
          var otherUserKeys = null;

          if (user) {
            var id = user.id,
                ip_address = user.ip_address,
                email = user.email,
                username = user.username,
                otherKeys = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__rest"])(user, ["id", "ip_address", "email", "username"]);
            defaultUserKeys = this._serializeObject({
              email: email,
              id: id,
              ip_address: ip_address,
              username: username
            });
            otherUserKeys = this._serializeObject(otherKeys);
          }

          SentryCapacitor.setUser(defaultUserKeys, otherUserKeys);
        },

        /**
         * Sets a tag in the native module.
         * @param key string
         * @param value string
         */
        setTag: function setTag(key, value) {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          }

          var stringifiedValue = typeof value === 'string' ? value : JSON.stringify(value);
          SentryCapacitor.setTag(key, stringifiedValue);
        },

        /**
         * Sets an extra in the native scope, will stringify
         * extra value if it isn't already a string.
         * @param key string
         * @param extra any
         */
        setExtra: function setExtra(key, extra) {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          } // we stringify the extra as native only takes in strings.


          var stringifiedExtra = typeof extra === 'string' ? extra : JSON.stringify(extra); // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

          SentryCapacitor.setExtra(key, stringifiedExtra);
        },

        /**
         * Adds breadcrumb to the native scope.
         * @param breadcrumb Breadcrumb
         */
        addBreadcrumb: function addBreadcrumb(breadcrumb) {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          }

          SentryCapacitor.addBreadcrumb(Object.assign(Object.assign({}, breadcrumb), {
            // Process and convert deprecated levels
            level: breadcrumb.level ? this._processLevel(breadcrumb.level) : undefined,
            data: breadcrumb.data ? this._serializeObject(breadcrumb.data) : undefined
          }));
        },

        /**
         * Clears breadcrumbs on the native scope.
         */
        clearBreadcrumbs: function clearBreadcrumbs() {
          if (!this.enableNative) {
            return;
          }

          if (!this.isNativeClientAvailable()) {
            throw this._NativeClientError;
          }

          SentryCapacitor.clearBreadcrumbs();
        },

        /**
         * Serializes all values of root-level keys into strings.
         * @param data key-value map.
         * @returns An object where all root-level values are strings.
         */
        _serializeObject: function _serializeObject(data) {
          var serialized = {};
          Object.keys(data).forEach(function (dataKey) {
            var value = data[dataKey];
            serialized[dataKey] = typeof value === 'string' ? value : JSON.stringify(value);
          });
          return serialized;
        },

        /**
         * Convert js severity level which has critical and log to more widely supported levels.
         * @param level
         * @returns More widely supported Severity level strings
         */
        _processLevel: function _processLevel(level) {
          if (level === _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Severity"].Critical) {
            return _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Severity"].Fatal;
          }

          if (level === _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Severity"].Log) {
            return _sentry_types__WEBPACK_IMPORTED_MODULE_2__["Severity"].Debug;
          }

          return level;
        },

        /**
         * Checks whether the SentryCapacitor module is loaded.
         */
        isModuleLoaded: function isModuleLoaded() {
          return !!SentryCapacitor;
        },

        /**
         *  Checks whether the SentryCapacitor module is loaded and the native client is available
         */
        isNativeClientAvailable: function isNativeClientAvailable() {
          return this.isModuleLoaded() && _capacitor_core__WEBPACK_IMPORTED_MODULE_1__["Capacitor"].isPluginAvailable('SentryCapacitor');
        },
        _DisabledNativeError: new _sentry_utils__WEBPACK_IMPORTED_MODULE_3__["SentryError"]('Native is disabled'),
        _NativeClientError: new _sentry_utils__WEBPACK_IMPORTED_MODULE_3__["SentryError"]("Native Client is not available, can't start on native."),
        enableNative: true
      }; //# sourceMappingURL=wrapper.js.map

      /***/
    },

    /***/
    "./$$_lazy_route_resource lazy recursive":
    /*!******************************************************!*\
      !*** ./$$_lazy_route_resource lazy namespace object ***!
      \******************************************************/

    /*! no static exports found */

    /***/
    function $$_lazy_route_resourceLazyRecursive(module, exports) {
      function webpackEmptyAsyncContext(req) {
        // Here Promise.resolve().then() is used instead of new Promise() to prevent
        // uncaught exception popping up in devtools
        return Promise.resolve().then(function () {
          var e = new Error("Cannot find module '" + req + "'");
          e.code = 'MODULE_NOT_FOUND';
          throw e;
        });
      }

      webpackEmptyAsyncContext.keys = function () {
        return [];
      };

      webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
      module.exports = webpackEmptyAsyncContext;
      webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";
      /***/
    },

    /***/
    "./node_modules/@ionic/core/dist/esm lazy recursive ^\\.\\/.*\\.entry\\.js$ include: \\.entry\\.js$ exclude: \\.system\\.entry\\.js$":
    /*!*****************************************************************************************************************************************!*\
      !*** ./node_modules/@ionic/core/dist/esm lazy ^\.\/.*\.entry\.js$ include: \.entry\.js$ exclude: \.system\.entry\.js$ namespace object ***!
      \*****************************************************************************************************************************************/

    /*! no static exports found */

    /***/
    function node_modulesIonicCoreDistEsmLazyRecursiveEntryJs$IncludeEntryJs$ExcludeSystemEntryJs$(module, exports, __webpack_require__) {
      var map = {
        "./ion-action-sheet.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-action-sheet.entry.js", "common", 0],
        "./ion-alert.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-alert.entry.js", "common", 1],
        "./ion-app_8.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-app_8.entry.js", "common", 2],
        "./ion-avatar_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-avatar_3.entry.js", "common", 3],
        "./ion-back-button.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-back-button.entry.js", "common", 4],
        "./ion-backdrop.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-backdrop.entry.js", 5],
        "./ion-button_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-button_2.entry.js", "common", 6],
        "./ion-card_5.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-card_5.entry.js", "common", 7],
        "./ion-checkbox.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-checkbox.entry.js", "common", 8],
        "./ion-chip.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-chip.entry.js", "common", 9],
        "./ion-col_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-col_3.entry.js", 10],
        "./ion-datetime_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-datetime_3.entry.js", "common", 11],
        "./ion-fab_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-fab_3.entry.js", "common", 12],
        "./ion-img.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-img.entry.js", 13],
        "./ion-infinite-scroll_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-infinite-scroll_2.entry.js", 14],
        "./ion-input.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-input.entry.js", "common", 15],
        "./ion-item-option_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-item-option_3.entry.js", "common", 16],
        "./ion-item_8.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-item_8.entry.js", "common", 17],
        "./ion-loading.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-loading.entry.js", "common", 18],
        "./ion-menu_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-menu_3.entry.js", "common", 19],
        "./ion-modal.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-modal.entry.js", "common", 20],
        "./ion-nav_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-nav_2.entry.js", "common", 21],
        "./ion-popover.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-popover.entry.js", "common", 22],
        "./ion-progress-bar.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-progress-bar.entry.js", "common", 23],
        "./ion-radio_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-radio_2.entry.js", "common", 24],
        "./ion-range.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-range.entry.js", "common", 25],
        "./ion-refresher_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-refresher_2.entry.js", "common", 26],
        "./ion-reorder_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-reorder_2.entry.js", "common", 27],
        "./ion-ripple-effect.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-ripple-effect.entry.js", 28],
        "./ion-route_4.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-route_4.entry.js", "common", 29],
        "./ion-searchbar.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-searchbar.entry.js", "common", 30],
        "./ion-segment_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-segment_2.entry.js", "common", 31],
        "./ion-select_3.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-select_3.entry.js", "common", 32],
        "./ion-slide_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-slide_2.entry.js", 33],
        "./ion-spinner.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-spinner.entry.js", "common", 34],
        "./ion-split-pane.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-split-pane.entry.js", 35],
        "./ion-tab-bar_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-tab-bar_2.entry.js", "common", 36],
        "./ion-tab_2.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-tab_2.entry.js", "common", 37],
        "./ion-text.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-text.entry.js", "common", 38],
        "./ion-textarea.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-textarea.entry.js", "common", 39],
        "./ion-toast.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-toast.entry.js", "common", 40],
        "./ion-toggle.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-toggle.entry.js", "common", 41],
        "./ion-virtual-scroll.entry.js": ["./node_modules/@ionic/core/dist/esm/ion-virtual-scroll.entry.js", 42]
      };

      function webpackAsyncContext(req) {
        if (!__webpack_require__.o(map, req)) {
          return Promise.resolve().then(function () {
            var e = new Error("Cannot find module '" + req + "'");
            e.code = 'MODULE_NOT_FOUND';
            throw e;
          });
        }

        var ids = map[req],
            id = ids[0];
        return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(function () {
          return __webpack_require__(id);
        });
      }

      webpackAsyncContext.keys = function webpackAsyncContextKeys() {
        return Object.keys(map);
      };

      webpackAsyncContext.id = "./node_modules/@ionic/core/dist/esm lazy recursive ^\\.\\/.*\\.entry\\.js$ include: \\.entry\\.js$ exclude: \\.system\\.entry\\.js$";
      module.exports = webpackAsyncContext;
      /***/
    },

    /***/
    "./node_modules/raw-loader/dist/cjs.js!./src/app/app.component.html":
    /*!**************************************************************************!*\
      !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/app.component.html ***!
      \**************************************************************************/

    /*! exports provided: default */

    /***/
    function node_modulesRawLoaderDistCjsJsSrcAppAppComponentHtml(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony default export */


      __webpack_exports__["default"] = "<ion-app>\n  <ion-router-outlet></ion-router-outlet>\n</ion-app>\n";
      /***/
    },

    /***/
    "./src/app/app-routing.module.ts":
    /*!***************************************!*\
      !*** ./src/app/app-routing.module.ts ***!
      \***************************************/

    /*! exports provided: AppRoutingModule */

    /***/
    function srcAppAppRoutingModuleTs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function () {
        return AppRoutingModule;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "./node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @angular/core */
      "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
      /* harmony import */


      var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @angular/router */
      "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");

      var routes = [{
        path: '',
        loadChildren: function loadChildren() {
          return __webpack_require__.e(
          /*! import() | tabs-tabs-module */
          "tabs-tabs-module").then(__webpack_require__.bind(null,
          /*! ./tabs/tabs.module */
          "./src/app/tabs/tabs.module.ts")).then(function (m) {
            return m.TabsPageModule;
          });
        }
      }];

      var AppRoutingModule = function AppRoutingModule() {
        _classCallCheck(this, AppRoutingModule);
      };

      AppRoutingModule = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
        imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes, {
          preloadingStrategy: _angular_router__WEBPACK_IMPORTED_MODULE_2__["PreloadAllModules"]
        })],
        exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
      })], AppRoutingModule);
      /***/
    },

    /***/
    "./src/app/app.component.scss":
    /*!************************************!*\
      !*** ./src/app/app.component.scss ***!
      \************************************/

    /*! exports provided: default */

    /***/
    function srcAppAppComponentScss(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony default export */


      __webpack_exports__["default"] = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */";
      /***/
    },

    /***/
    "./src/app/app.component.ts":
    /*!**********************************!*\
      !*** ./src/app/app.component.ts ***!
      \**********************************/

    /*! exports provided: AppComponent */

    /***/
    function srcAppAppComponentTs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "AppComponent", function () {
        return AppComponent;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "./node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @angular/core */
      "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
      /* harmony import */


      var _ionic_angular__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @ionic/angular */
      "./node_modules/@ionic/angular/__ivy_ngcc__/fesm2015/ionic-angular.js");
      /* harmony import */


      var _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! @ionic-native/splash-screen/ngx */
      "./node_modules/@ionic-native/splash-screen/__ivy_ngcc__/ngx/index.js");
      /* harmony import */


      var _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
      /*! @ionic-native/status-bar/ngx */
      "./node_modules/@ionic-native/status-bar/__ivy_ngcc__/ngx/index.js");

      var AppComponent = /*#__PURE__*/function () {
        function AppComponent(platform, splashScreen, statusBar) {
          _classCallCheck(this, AppComponent);

          this.platform = platform;
          this.splashScreen = splashScreen;
          this.statusBar = statusBar;
          this.initializeApp();
        }

        _createClass(AppComponent, [{
          key: "initializeApp",
          value: function initializeApp() {
            var _this3 = this;

            this.platform.ready().then(function () {
              _this3.statusBar.styleDefault();

              _this3.splashScreen.hide();
            });
          }
        }]);

        return AppComponent;
      }();

      AppComponent.ctorParameters = function () {
        return [{
          type: _ionic_angular__WEBPACK_IMPORTED_MODULE_2__["Platform"]
        }, {
          type: _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_3__["SplashScreen"]
        }, {
          type: _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_4__["StatusBar"]
        }];
      };

      AppComponent = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-root',
        template: Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"])(__webpack_require__(
        /*! raw-loader!./app.component.html */
        "./node_modules/raw-loader/dist/cjs.js!./src/app/app.component.html"))["default"],
        styles: [Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"])(__webpack_require__(
        /*! ./app.component.scss */
        "./src/app/app.component.scss"))["default"]]
      })], AppComponent);
      /***/
    },

    /***/
    "./src/app/app.module.ts":
    /*!*******************************!*\
      !*** ./src/app/app.module.ts ***!
      \*******************************/

    /*! exports provided: AppModule */

    /***/
    function srcAppAppModuleTs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "AppModule", function () {
        return AppModule;
      });
      /* harmony import */


      var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! tslib */
      "./node_modules/tslib/tslib.es6.js");
      /* harmony import */


      var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @angular/core */
      "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
      /* harmony import */


      var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! @angular/platform-browser */
      "./node_modules/@angular/platform-browser/__ivy_ngcc__/fesm2015/platform-browser.js");
      /* harmony import */


      var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! @angular/router */
      "./node_modules/@angular/router/__ivy_ngcc__/fesm2015/router.js");
      /* harmony import */


      var _ionic_angular__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(
      /*! @ionic/angular */
      "./node_modules/@ionic/angular/__ivy_ngcc__/fesm2015/ionic-angular.js");
      /* harmony import */


      var _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(
      /*! @ionic-native/splash-screen/ngx */
      "./node_modules/@ionic-native/splash-screen/__ivy_ngcc__/ngx/index.js");
      /* harmony import */


      var _ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(
      /*! @ionic-native/status-bar/ngx */
      "./node_modules/@ionic-native/status-bar/__ivy_ngcc__/ngx/index.js");
      /* harmony import */


      var _sentry_capacitor__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(
      /*! @sentry/capacitor */
      "../../dist/esm/index.js");
      /* harmony import */


      var _sentry_tracing__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(
      /*! @sentry/tracing */
      "./node_modules/@sentry/tracing/esm/index.js");
      /* harmony import */


      var _app_routing_module__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(
      /*! ./app-routing.module */
      "./src/app/app-routing.module.ts");
      /* harmony import */


      var _app_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(
      /*! ./app.component */
      "./src/app/app.component.ts"); // ATTENTION: Change the DSN below with your own to see the events in Sentry. Get one at sentry.io


      _sentry_capacitor__WEBPACK_IMPORTED_MODULE_7__["init"]({
        dsn: 'https://48fce7f88fb54b8788d9242310630b52@o476433.ingest.sentry.io/5538147',
        // An array of strings or regexps that'll be used to ignore specific errors based on their type/message
        ignoreErrors: [/MiddleEarth_\d\d/, 'RangeError'],
        // Debug mode with valuable initialization/lifecycle information
        debug: true,
        // Whether SDK should be enabled or not
        enabled: true,
        integrations: [new _sentry_tracing__WEBPACK_IMPORTED_MODULE_8__["Integrations"].BrowserTracing()],
        // A release identifier
        release: '1537345109360',
        // An environment identifier
        environment: 'staging',
        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0
      });

      var AppModule = function AppModule() {
        _classCallCheck(this, AppModule);
      };

      AppModule = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
        declarations: [_app_component__WEBPACK_IMPORTED_MODULE_10__["AppComponent"]],
        entryComponents: [],
        imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__["BrowserModule"], _ionic_angular__WEBPACK_IMPORTED_MODULE_4__["IonicModule"].forRoot(), _app_routing_module__WEBPACK_IMPORTED_MODULE_9__["AppRoutingModule"]],
        providers: [_ionic_native_status_bar_ngx__WEBPACK_IMPORTED_MODULE_6__["StatusBar"], _ionic_native_splash_screen_ngx__WEBPACK_IMPORTED_MODULE_5__["SplashScreen"], {
          provide: _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouteReuseStrategy"],
          useClass: _ionic_angular__WEBPACK_IMPORTED_MODULE_4__["IonicRouteStrategy"]
        }],
        bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_10__["AppComponent"]]
      })], AppModule);
      /***/
    },

    /***/
    "./src/environments/environment.ts":
    /*!*****************************************!*\
      !*** ./src/environments/environment.ts ***!
      \*****************************************/

    /*! exports provided: environment */

    /***/
    function srcEnvironmentsEnvironmentTs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony export (binding) */


      __webpack_require__.d(__webpack_exports__, "environment", function () {
        return environment;
      }); // This file can be replaced during build by using the `fileReplacements` array.
      // `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
      // The list of file replacements can be found in `angular.json`.


      var environment = {
        production: false
      };
      /*
       * For easier debugging in development mode, you can import the following file
       * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
       *
       * This import should be commented out in production mode because it will have a negative impact
       * on performance if an error is thrown.
       */
      // import 'zone.js/dist/zone-error';  // Included with Angular CLI.

      /***/
    },

    /***/
    "./src/main.ts":
    /*!*********************!*\
      !*** ./src/main.ts ***!
      \*********************/

    /*! no exports provided */

    /***/
    function srcMainTs(module, __webpack_exports__, __webpack_require__) {
      "use strict";

      __webpack_require__.r(__webpack_exports__);
      /* harmony import */


      var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
      /*! @angular/core */
      "./node_modules/@angular/core/__ivy_ngcc__/fesm2015/core.js");
      /* harmony import */


      var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
      /*! @angular/platform-browser-dynamic */
      "./node_modules/@angular/platform-browser-dynamic/__ivy_ngcc__/fesm2015/platform-browser-dynamic.js");
      /* harmony import */


      var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(
      /*! ./app/app.module */
      "./src/app/app.module.ts");
      /* harmony import */


      var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(
      /*! ./environments/environment */
      "./src/environments/environment.ts");

      if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
      }

      Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])["catch"](function (err) {
        return console.log(err);
      });
      /***/
    },

    /***/
    0:
    /*!***************************!*\
      !*** multi ./src/main.ts ***!
      \***************************/

    /*! no static exports found */

    /***/
    function _(module, exports, __webpack_require__) {
      module.exports = __webpack_require__(
      /*! /Users/cortneythomas/Documents/Projects/work/sentry-capacitor/example/ionic-angular/src/main.ts */
      "./src/main.ts");
      /***/
    }
  }, [[0, "runtime", "vendor"]]]);
})();
//# sourceMappingURL=main-es5.js.map