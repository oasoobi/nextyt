"use client"

import { Suspense, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { useSearchParams } from "next/navigation"
import { Video as VideoCard } from "@/components/cards/video";
import { Channel as ChannelCard } from "@/components/cards/channel";
import { Playlist as PlaylistCard } from "@/components/cards/playlist";
type Video = {
    "type": "video",
    "title": string,
    "videoId": string,
    "author": string,
    "authorId": string,
    "authorUrl": string,
    "authorVerified": boolean,
    "videoThumbnails": {
        "quality": string,
        "url": string
        "width": number,
        "height": number
    }[],
    "description": string,
    "descriptionHTML": string,
    "viewCount": number,
    "viewCountText": string,
    "published": number,
    "publishedText": string,
    "lengthSeconds": number,
    "liveNow": boolean,
    "premium": boolean,
    "isUpcoming": boolean
}

type Channel = {
    "type": "channel",
    "author": string,
    "authorId": string,
    "authorUrl": string,
    "authorVerified": boolean,
    "authorThumbnails": {
        "url": string
        "width": number,
        "height": number
    }[],
    "autoGenerated": boolean,
    "subCount": number,
    "videoCount": number,
    "channelHandle": string,
    "description": string,
    "descriptionHtml": string
}

type Playlist = {
    "type": "playlist";
    "title": string;
    "playlistId": string;
    "playlistThumbnail": string;
    "author": string;
    "authorId": string;
    "authorUrl": string;
    "authorVerified": boolean;
    "videoCount": number;
    "videos": {
        "title": string;
        "videoId": string;
        "lengthSeconds": number;
        "videoThumbnails": {
            "quality": string;
            "url": string;
            "width": number;
            "height": number;
        }[];
    }[];
};


type searchResult = (Video | Channel | Playlist)[];

async function fetcher(key: string) {
    return fetch(key).then((res) => res.json() as Promise<searchResult | null>);
}

export function SearchResult() {
    const params = useSearchParams();
    const [word, setWord] = useState(params.get("q"));
    const [results, setResults] = useState<searchResult>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setWord(params.get("q"));
        setResults([]); //過去のresultをリセット
    }, [params]);

    const { data, error, isLoading } = useSWR(
        word ? (`/api/s?q=` + word + "&p=" + page) : null,
        fetcher
    );

    useEffect(() => {
        if (data) {
            setResults(prevResults => [...prevResults, ...data]);
        }
    }, [data]);

    const getMoreResults = () => {
        setPage(prevPage => prevPage + 1);
        mutate(word ? (`/api/s?q=` + word + "&p=" + page) : null)
    }

    return (
        <main className="p-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                {results?.map((data) =>
                    data.type == "video" ? <VideoCard video={data as Video} key={data.videoId} /> :
                        data.type == "playlist" ? <PlaylistCard playlist={data as Playlist} key={data.playlistId} /> :
                            <ChannelCard channel={data as Channel} key={data.authorId} />)}
            </div>
            <button
                type="button"
                className={`w-full border mt-5 h-14 rounded-md transition-colors hover:bg-gray-100 ${isLoading ? "bg-gray-100" : ""}`}
                onClick={getMoreResults}
                disabled={isLoading}
            >
                {isLoading ? "読み込み中..." : "もっと読み込む"}
            </button>
        </main>
    );
}
