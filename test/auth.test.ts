import 'mocha';
import { expect } from 'chai';
import { getRequestClient } from '../src/test/utils';

// OAuth 1.0a
const clientWithoutUser = getRequestClient();

describe('Authentication API', () => {
  it('.generateAuthLink - Create an auth link', async () => {
    const { url, oauth_token, oauth_token_secret, oauth_callback_confirmed } = await clientWithoutUser.generateAuthLink('oob');

    expect(oauth_token).to.be.a('string');
    expect(oauth_token_secret).to.be.a('string');
    expect(oauth_callback_confirmed).to.be.equal('true');
    expect(url).to.be.a('string');
  }).timeout(1000 * 120);
});
