
// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Convert a YouTube ID or URL into an embeddable YouTube iframe URL
export function getYoutubeEmbedUrl(url) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(url)}`;
}

// Thumbnail for YouTube videos
export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function isBeatLeaderLink(url) {
    return url.includes("replay.beatleader.com");
}

export function getBeatLeaderEmbedUrl(url) {
    return url; 
}


export function embed(video) {
    if (!video) return "";

    // BeatLeader replay
    if (isBeatLeaderLink(video)) {
        return getBeatLeaderEmbedUrl(video);
    }

    // Otherwise treat as YouTube
    return getYoutubeEmbedUrl(video);
}


export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

// Shuffle an array (Fisher-Yates)
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex],
        ];
    }

    return array;
}