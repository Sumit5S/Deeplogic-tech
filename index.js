const https = require('https');

const url = 'https://time.com';

function fetchTimeStories(callback) {
    https.get(url, (res) => {
        let data = '';

        // Collect the data chunks
        res.on('data', (chunk) => {
            data += chunk;
        });

        // Process the data 
        res.on('end', () => {
            const stories = [];
            let remainingHtml = data;
            const maxStories = 6;

            for (let i = 0; i < maxStories; i++) {
                // find start of the next story 
                let itemStart = remainingHtml.indexOf('<li class="latest-stories__item');
                if (itemStart === -1) break;

                // go to the block containing the title and link
                let titleStart = remainingHtml.indexOf('<h3', itemStart);
                if (titleStart === -1) break;

                titleStart = remainingHtml.indexOf('>', titleStart) + 1; // move to title text
                let titleEnd = remainingHtml.indexOf('</h3>', titleStart);
                let title = remainingHtml.substring(titleStart, titleEnd).trim();

                // Find the link of the title
                let linkStart = remainingHtml.indexOf('href="', itemStart) + 'href="'.length;
                let linkEnd = remainingHtml.indexOf('"', linkStart);
                let link = remainingHtml.substring(linkStart, linkEnd);

                stories.push({ "title": title, "link": url + link });

                // Move to the next story
                remainingHtml = remainingHtml.substring(itemStart + 1);
            }

            // Handle case where fewer than 6 stories are found
            if (stories.length < maxStories) {
                console.warn(`Fewer than ${maxStories} stories found.`);
            }

            callback(stories);
        });

    }).on('error', (e) => {
        console.error('Error fetching stories:', e);
        callback([]);
    });
}


fetchTimeStories((stories) => {
    console.log(JSON.stringify(stories, null, 2));
});
