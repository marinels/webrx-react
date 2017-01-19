import { should, fail, logger, sandbox, sinon } from '../setup';
import { HttpRequestMethod, ObservableApi } from '../../src/Stores/ObservableApi';
import { Observable, DOM as rxdom } from 'rx-dom';
import * as wx from 'webrx';

describe('ObservableApi', () => {
  const baseUri = 'http://test1.com/';
  const api = new ObservableApi(baseUri);
  const action = 'action';
  const data = { item1: 'item1 value' };
  const body = String.stringify(data, null, 2);
  const params = { param1: 'param1 value' };
  const uriParams = 'param1=param1+value';
  const options = <wx.IHttpClientOptions>{
    xmlHttpRequest: () => {
      const xhr = new XMLHttpRequest();

      xhr.timeout = 1;

      return xhr;
    },
  };
  const baseUriOverride = 'http://test2.com/';

  describe('getObservableResult', () => {
    it('creates a GET request', () => {
      const request = Observable.of(true);
      const stub = sandbox.stub(api, 'getRequest', () => request);

      const result = api.getObservableResult(action, params, data, HttpRequestMethod.GET, options, baseUriOverride);

      should.exist(result);
      Observable.isObservable(result).should.be.true;
      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith(`${baseUriOverride}${action}`, HttpRequestMethod.GET, params, data, options);
    });

    it('creates a POST request', () => {
      const request = Observable.of(true);
      const stub = sandbox.stub(api, 'getRequest', () => request);

      const result = api.getObservableResult(action, params, data, HttpRequestMethod.POST, options, baseUriOverride);

      should.exist(result);
      Observable.isObservable(result).should.be.true;
      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith(`${baseUriOverride}${action}`, HttpRequestMethod.POST, params, data, options);
    });

    it('composes GET request options from the provided parameters', () => {
      const expectedOptions = {
        headers: ObservableApi.defaultHeaders,
        async: true,
        body,
        url: `${ baseUri }${ action }?${ uriParams }`,
        method: 'GET',
      };
      const request = Observable.of(true);
      const stub = sandbox.stub(rxdom, 'ajax', () => request);

      api.getObservableResult(action, params, data, HttpRequestMethod.GET);

      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith(expectedOptions);
    });

    it('composes POST request options from the provided parameters', () => {
      const expectedOptions = {
        headers: ObservableApi.defaultHeaders,
        async: true,
        body,
        url: `${ baseUri }${ action }?${ uriParams }`,
        method: 'POST',
      };
      const request = Observable.of(true);
      const stub = sandbox.stub(rxdom, 'ajax', () => request);

      api.getObservableResult(action, params, data, HttpRequestMethod.POST);

      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith(expectedOptions);
    });

    it('omits null param values from the uri', () => {
      const request = Observable.of(true);
      const stub = sandbox.stub(rxdom, 'ajax', () => request);
      api.getObservableResult(action, { param1: 'param1 value', param2: null, param3: undefined });

      stub.should.have.been.calledOnce;
      stub.firstCall.args[0].url.should.eql(`${ baseUri }${ action }?${ uriParams }`);
    });
  });

  describe('getObservable', () => {
    it('calls getObservableResult with null data and GET method', () => {
      const expectedResult = 'result';
      const stub = sandbox.stub(api, 'getObservableResult', () => expectedResult);

      const result = api.getObservable<any>(action, params, options, baseUriOverride);

      should.exist(result);
      result.should.eql(expectedResult);
      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith(action, params, undefined, HttpRequestMethod.GET, options, baseUriOverride);
    });
  });

  describe('postObservable', () => {
    it('calls getObservableResult with POST method', () => {
      const expectedResult = 'result';
      const stub = sandbox.stub(api, 'getObservableResult', () => expectedResult);

      const result = api.postObservable<any>(action, data, params, options, baseUriOverride);

      should.exist(result);
      result.should.eql(expectedResult);
      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith(action, params, data, HttpRequestMethod.POST, options, baseUriOverride);
    });
  });
});
