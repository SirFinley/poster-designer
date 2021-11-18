import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import cheerio from 'cheerio';
import { URLSearchParams } from 'url';

const reviewUrl = 'https://www.etsy.com/api/v3/ajax/bespoke/member/neu/specs/reviews';
const store = 'CGGraphicsUS'
const pageCount = 2;
const variations = []; 

getAllVariations();

async function getAllVariations(){

    let allIds = [];
    for(let i = 1; i <= pageCount; i++) {
        console.log('page ' + i);
        
        let ids = await getTransactionIds(i); // TODO: is only returning transaction ids for first page despite specifying different page numbers
        allIds.push(...ids);
        
        variations.push(...await getVariations(ids));
    }

    // let uniqueIds = new Set(allIds);
    // console.log('unique ids:');
    // console.log(uniqueIds);
    

    console.log(variations);
    fs.writeFileSync(`./data/${store}.txt`, variations.join('\n'), {
        flag: 'w'
    })
}

async function getTransactionIds(pageNum: number): Promise<string[]> {
    let data = getFormData(pageNum);
    

    var config = {
        headers: { 
            ...getHeaders(),
            ...data.getHeaders()
        },
    };

    let response = await axios.post(reviewUrl, data, config)
    let html = response.data.output.reviews as string; // html of reviews
    let $ = cheerio.load(html);

    let transactionIds = $('[data-transaction-id]').toArray().map(e => $(e).attr('data-transaction-id'));
    return transactionIds;
}

function getFormData(pageNum: number) {
    const rawFormData = fs.readFileSync('./etc/formData.txt').toString();
    let lines = rawFormData.replaceAll('\r\n', '\n').split('\n');

    let formData = new FormData();
    for (let line of lines) {
        let kvp = line.split(':');
        let key = kvp[0];
        let value = kvp[1];
        if (/page/.test(key)) {
            continue;
        }
        formData.append(key, value);
    }
    
    formData.append('specs[reviews][1][page]', ' ' + pageNum.toString());

    return formData;
}

function getHeaders() {
    const rawHeaders = fs.readFileSync('./etc/headers.txt').toString();
    let lines = rawHeaders.replaceAll('\r\n', '\n').split('\n');

    let headers: Record<string,string> = {}
    for (let line of lines) {
        if (line.startsWith(':')){
            continue;
        }

        let splitIndex = line.indexOf(':');
        let key = line.substring(0, splitIndex);
        let value = line.substring(splitIndex+1, line.length).trim();
        headers[key] = value;
    }

    return headers;
}

function getVariationsSearchParams(transactionIds: string[]): URLSearchParams {
    const rawQueryParams = fs.readFileSync('./etc/get-variations_query-parms.txt').toString();
    let lines = rawQueryParams.replaceAll('\r\n', '\n').split('\n');

    let params = new URLSearchParams();
    for (let line of lines) {
        let kvp = line.split(':');
        let key = kvp[0];
        let value = kvp[1];
        if (/transaction_ids/.test(key)) {
            continue;
        }

        params.append(key, value);
    }

    transactionIds.forEach(id => {
        params.append('specs[listing_async_review_variations][1][transaction_ids][]',  id.toString());
    });

    return params;
}

async function getVariations(transactionIds: string[]) {
    const url = new URL('https://www.etsy.com/api/v3/ajax/bespoke/public/neu/specs/listing_async_review_variations');
    url.search = getVariationsSearchParams(transactionIds).toString();
    url.searchParams.append

    let response = await axios.get(url.toString());
    let $ = cheerio.load(response.data.output.listing_async_review_variations);
    let variations = $('.variation-info').toArray().map(e => $(e).text().replaceAll(/\s{2,}/g, ''));
    
    return variations;
}

