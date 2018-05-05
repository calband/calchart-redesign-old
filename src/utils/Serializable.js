/**
 * @file Defines the Serializable class.
 *
 * Calchart classes that can be serialized to JSON should extend this class. The
 * constructor will already be provided to set the instance's properties based
 * on the data.
 *
 * The constructor (called with `super(data, ..)`) should also be passed an
 * object containing information about the types expected in the data. See
 * `utils/types.checkTypes` for more information.
 */

import {
    assign,
    clone,
    forIn,
    has,
    hasIn,
    isArray,
    isPlainObject,
    isNull,
    mapValues,
} from 'lodash';

import { underscoreKeys } from 'utils/JSUtils';
import { checkTypeError, isSubClass } from 'utils/types';

/**
 * For every underscored property in the object, add a getter without the
 * underscore.
 *
 * @param {object} object
 */
function addGetters(object) {
    forIn(object, (v, k) => {
        let newK = k.replace(/^_/, '');
        Object.defineProperty(object, newK, {
            get: () => object[k],
        });
    });
}

export class BaseSerializable {
    /**
     * @param {Object} data
     * @param {Object} types
     */
    constructor(data, types) {
        checkTypeError(data, {
            _type: 'object',
            _wraps: types,
        });
        assign(this, underscoreKeys(data));
        addGetters(this);
    }

    /**
     * Deserialize the given object.
     *
     * Do not override this function. Overriding `_postDeserialize` should be
     * sufficient for most cases. For even more customization, override
     * `_deserialize`.
     *
     * @param {Object} data
     * @param {Show} show
     * @return {Serializable}
     */
    static deserialize(data, show) {
        delete data.__type__;
        return this._deserialize(data, show);
    }

    /**
     * Get the Class for the given name of the Class.
     *
     * @param {string} name
     * @return {Class}
     */
    static getClass(name) {
        return undefined;
    }

    /**
     * Deserialize the given object.
     *
     * @param {Object} data
     * @param {Show} show
     * @return {Serializable}
     */
    static _deserialize(data, show) {
        let _doDeserialize = v => {
            if (has(v, '__type__')) {
                return this.getClass(v.__type__).deserialize(v, show);
            } else if (isArray(v)) {
                return v.map(_doDeserialize);
            } else if (isPlainObject(v)) {
                return mapValues(v, _doDeserialize);
            } else {
                return v;
            }
        };

        data = mapValues(data, (v, k) => {
            let newV = _doDeserialize(v);
            return this._postDeserialize(k, newV, show);
        });
        return new this(data);
    }

    /**
     * Postprocess the given value after deserialization.
     *
     * Provided the key of the property being deserialized.
     *
     * @param {string} k
     * @param {Any} v
     * @param {Show} show
     * @return {Any}
     */
    static _postDeserialize(k, v, show) {
        return v;
    }

    /**
     * @return {Serializable}
     */
    clone() {
        let cloned = clone(this);
        addGetters(cloned);
        return cloned;
    }

    /**
     * Serialize this object.
     *
     * Do not override this function. Overriding `_preSerialize` should be
     * sufficient for most cases. For even more customization, override
     * `_serialize`.
     *
     * @return {Object}
     */
    serialize() {
        let data = this._serialize();
        // needed to distinguish classes when deserializing
        data.__type__ = this.constructor.name;
        return data;
    }

    /**
     * Preprocess the given value before serialization.
     *
     * Provided the key of the property being serialized.
     *
     * @param {string} k
     * @param {Any} v
     * @return {Any}
     */
    _preSerialize(k, v) {
        return v;
    }

    /**
     * Serialize this object, mapping `data.key = object._key`.
     *
     * @return {Object}
     */
    _serialize() {
        function _doSerialize(v) {
            if (hasIn(v, 'serialize')) {
                return v.serialize();
            } else if (isArray(v)) {
                return v.map(_doSerialize);
            } else if (isPlainObject(v)) {
                return mapValues(v, _doSerialize);
            } else {
                return v;
            }
        }

        let data = {};
        forIn(this, (v, k) => {
            let newK = k.replace(/^_/, '');
            let newV = this._preSerialize(newK, v);
            data[newK] = _doSerialize(newV);
        });
        return data;
    }
}

/**
 * A mapping of Calchart classes, to be dynamically imported.
 *
 * @type {?Object<string: Class>}
 */
let CALCHART_CLASSES = null;

export default class Serializable extends BaseSerializable {
    /**
     * @param {string} name
     * @param {Class}
     */
    static getClass(name) {
        if (isNull(CALCHART_CLASSES)) {
            let req = require.context('../calchart/', true, /\.js$/);
            CALCHART_CLASSES = {};
            req.keys().forEach(f => {
                forIn(req(f), cls => {
                    if (isSubClass(cls, Serializable)) {
                        CALCHART_CLASSES[cls.name] = cls;
                    }
                });
            });
        }
        return CALCHART_CLASSES[name];
    }
}
