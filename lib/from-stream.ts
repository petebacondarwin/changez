import { Observable, Observer } from 'rxjs';
import { Readable } from "stream";

function fromStreamFn(stream: Readable, finishEventName: string = 'end', dataEventName: string = 'data') {

  stream.pause();

  return Observable.create(function (observer: Observer<string>) {
    function dataHandler(data) { console.log(data); observer.next(data); }
    function errorHandler(err) { observer.error(err); }
    function endHandler() { observer.complete(); }

    stream.addListener(dataEventName, dataHandler);
    stream.addListener('error', errorHandler);
    stream.addListener(finishEventName, endHandler);

    stream.resume();

    return function () {
      stream.removeListener(dataEventName, dataHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener(finishEventName, endHandler);
    };
  }).publish().refCount();
}

Observable.fromStream = fromStreamFn;

declare module 'rxjs/Observable' {
    namespace Observable {
        let fromStream: typeof fromStreamFn;
    }
}
