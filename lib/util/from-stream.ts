import { Observable, Observer } from 'rxjs';
import { Readable } from "stream";

function fromStreamFn(stream: Readable, finishEventName: string = 'end', dataEventName: string = 'data') {

  stream.pause();

  return Observable.create(function (observer: Observer<string>) {
    function next(data) { observer.next(data); }
    function error(err) { observer.error(err); }
    function complete() { observer.complete(); }

    stream.addListener(dataEventName, next);
    stream.addListener('error', error);
    stream.addListener(finishEventName, complete);

    stream.resume();

    return function () {
      stream.removeListener(dataEventName, next);
      stream.removeListener('error', error);
      stream.removeListener(finishEventName, complete);
    };
  }).publish().refCount();
}

Observable.fromStream = fromStreamFn;

declare module 'rxjs/Observable' {
    namespace Observable {
        let fromStream: typeof fromStreamFn;
    }
}
