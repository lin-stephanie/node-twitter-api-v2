import 'mocha';
import { expect } from 'chai';
import { getUserKeys, getRequestKeys } from '../src/test/utils';
import type {
  ITwitterApiClientPlugin,
  TwitterResponse,
  ITwitterApiBeforeRequestConfigHookArgs,
  ITwitterApiAfterRequestHookArgs,
  ITwitterApiAfterOAuth1RequestTokenHookArgs,
} from '../src';
import { TwitterApi } from '../src';

class SimpleCacheTestPlugin implements ITwitterApiClientPlugin {
  protected cache: { [urlHash: string]: TwitterResponse<any> } = {};

  onBeforeRequestConfig(args: ITwitterApiBeforeRequestConfigHookArgs) {
    const hash = this.getHashFromRequest(args);
    return this.cache[hash];
  }

  onAfterRequest(args: ITwitterApiAfterRequestHookArgs) {
    const hash = this.getHashFromRequest(args);
    this.cache[hash] = args.response;
  }

  protected getHashFromRequest({ url, params }: ITwitterApiBeforeRequestConfigHookArgs) {
    const strQuery = JSON.stringify(params.query ?? {});
    const strParams = JSON.stringify(params.params ?? {});

    return params.method.toUpperCase() + ' ' + url.toString() + '|' + strQuery + '|' + strParams;
  }
}

class SimpleOAuthStepHelperPlugin implements ITwitterApiClientPlugin {
  protected cache: { [oauthToken: string]: string } = {};

  onOAuth1RequestToken(args: ITwitterApiAfterOAuth1RequestTokenHookArgs) {
    this.cache[args.oauthResult.oauth_token] = args.oauthResult.oauth_token_secret;
  }

  async login(oauthToken: string, oauthVerifier: string) {
    if (!oauthVerifier || !this.isOAuthTokenValid(oauthToken)) {
      throw new Error('Invalid or expired token.');
    }

    const client = new TwitterApi({
      appKey: getRequestKeys().appKey,
      appSecret: getRequestKeys().appSecret,
    } as any);

    const { client: loggedClient } = await (client as any).loginWithOAuth1({
      accessToken: oauthToken,
      accessSecret: this.cache[oauthToken],
      verifier: oauthVerifier,
    });
    return loggedClient;
  }

  isOAuthTokenValid(oauthToken: string) {
    return !!this.cache[oauthToken];
  }
}

describe('Plugin API', () => {
  it('Cache a single request with a plugin', async () => {
    const client = new TwitterApi(getUserKeys() as any, { plugins: [new SimpleCacheTestPlugin()] });

    const user = await client.v1.verifyCredentials();
    const anotherRequest = await client.v1.verifyCredentials();

    expect(user).to.equal(anotherRequest);
  }).timeout(1000 * 30);

  it('Remember OAuth token secret between step 1 and 2 of authentication', async () => {
    const client = new TwitterApi(getRequestKeys() as any, { plugins: [new SimpleOAuthStepHelperPlugin()] });

    const { oauth_token } = await (client.v1 as any).oauth.requestToken({ oauth_callback: 'oob' });

    // Is oauth token registered in cache?
    const loginPlugin = client.getPluginOfType(SimpleOAuthStepHelperPlugin)!;
    expect(loginPlugin.isOAuthTokenValid(oauth_token)).to.equal(true);

    // Must login through
    // const loggedClient = await loginPlugin.login(oauth_token, 'xxxxxxxx');
    // - Save accessToken, accessSecret to persistent storage
  }).timeout(1000 * 30);
});
