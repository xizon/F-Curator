import axios from 'axios';
jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const getBase64 = async (url) => {
    try {
        return await axios
            .get(url, {
                timeout: 15000,
                responseType: 'arraybuffer'
            });

    } catch (e) {
        return [];
    }
};


const img = 'https://via.placeholder.com/300/09f/fff.png';

describe('Download Remote Image', () => {

    it('returns base64 string of image URL when axios() is done', async () => {
        
        // given
        mockedAxios.get.mockResolvedValueOnce(img);

        // when
        let result: any = await getBase64(img);
        result = Buffer.from(result, 'binary').toString('base64'); // aHR0cHM6Ly92aWEucGxhY2Vob2xkZXIuY29tLzMwMC8wOWYvZmZmLnBuZw==

        // then
        expect(axios.get).toHaveBeenCalledWith(img, {
            timeout: 15000,
            responseType: 'arraybuffer'
        });
        expect(typeof result).toBe('string');

    });

});


