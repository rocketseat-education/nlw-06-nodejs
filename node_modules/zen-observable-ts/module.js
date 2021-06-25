import { Observable } from "zen-observable/esm.js";

// When a non-native class constructor function attempts to subclass
// Observable, compilers like Babel and TypeScript may compile the
// super(subscriber) expression to Observable.call(this, subscriber) or
// Observable.apply(this, arguments). Calling a native class constructor
// in this way is forbidden by the ECMAScript specification, but we can
// preserve backwards compatibility by overriding the Observable.call and
// Observable.apply methods with an implementation that calls
// Reflect.construct instead, when available.

Observable.call = function (instance, subscriber) {
  // Since Observable.call is a static method, 'this' will typically be the
  // Observable constructor function, though it could be a subclass of the
  // Observable constructor, which is why we don't just hard-code it here.
  return construct(this, instance, subscriber);
};

Observable.apply = function (instance, args) {
  return construct(this, instance, args[0]);
};

function construct(Super, instance, subscriber) {
  return typeof Reflect === 'object'
    ? Reflect.construct(Super, [subscriber], instance.constructor)
    : Function.prototype.call.call(Super, instance, subscriber) || instance;
}

export { Observable }
