// Note: jsdom is imported here, the `testEnvironment` should be changed to the default "node"
import got from 'got';
import { JSDOM } from "jsdom";
import { mocked } from "ts-jest/utils";
jest.mock("got");



const testURL = 'https://www.npmjs.com';
const crawl = async () => {
    const body: any = await got.get(testURL, {
        timeout: {
            request: 5000
        }
    });
    return new JSDOM(body);
};

describe('Crawl Web', () => {

    it('returns method at got', async () => {
        
        const mockedGot = mocked(got);

        // use case #1 - using got module directly
        mockedGot.mockReturnValue(testURL as any);
    
        const response1: any = await crawl();
        expect( typeof( new JSDOM(response1).window ) ).toEqual('object');
    

        // use case #2 - using got.get "alias"
        /*
        mockedGot.get = jest.fn().mockReturnValue(testURL as any);

        const response2: any = await crawl();
        expect( typeof( new JSDOM(response2).window ) ).toEqual('object');
        */


    });

});


