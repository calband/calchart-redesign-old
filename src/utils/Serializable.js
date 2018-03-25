/**
 * @file Defines the Serializable class.
 *
 * Classes that can be serialized to JSON should extend this class.
 */

import {
    assign,
    forIn,
    has,
    isArray,
    isPlainObject,
    isNull,
    mapValues,
} from 'lodash';

import { isSubClass } from 'utils/classes';
import { underscoreKeys } from 'utils/JSUtils';

/**
 * Get the Class for the given name of the Class.
 *
 * @param {string} name
 * @return {Class}
 */
let _classes = null;
function getClass(name) {
    if (isNull(_classes)) {
        // Dynamically import all serialized classes
        let req = require.context('../calchart/', true, /\.js$/);
        _classes = {};
        req.keys().forEach(f => {
            forIn(req(f), cls => {
                if (isSubClass(cls, Serializable)) {
                    _classes[cls.name] = cls;
                }
            });
        });
    }
    return _classes[name];
}
window.getClass = getClass;

export default class Serializable {
    constructor(data) {
        assign(this, underscoreKeys(data));
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
     * Deserialize the given object.
     *
     * @param {Object} data
     * @param {Show} show
     * @return {Serializable}
     */
    static _deserialize(data, show) {
        function _doDeserialize(v) {
            if (has(v, '__type__')) {
                return getClass(v.__type__).deserialize(v, show);
            } else if (isArray(v)) {
                return v.map(_doDeserialize);
            } else if (isPlainObject(v)) {
                return mapValues(v, _doDeserialize);
            } else {
                return v;
            }
        }

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
            if (has(v, 'serialize')) {
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
