import { YoutubeVideo } from "./@types/youtube";

export type KnapsackResponse = {
    weight: number;
    value: number;
};

export type YoutubeKnapsackResponse = {
    video: YoutubeVideo;
    value: number;
    duration: number;
};

export const knapsack = (W: number, wt: number[], val: number[], n: number): KnapsackResponse[] => {
    let results: KnapsackResponse[] = [];

    let i: number, w: number;
    let K: number[][] = new Array(n + 1);
    for (i = 0; i < K.length; i++) {
        K[i] = new Array(W + 1);
        for (let j = 0; j < W + 1; j++) {
            K[i][j] = 0;
        }
    }
    for (i = 0; i <= n; i++) {
        for (w = 0; w <= W; w++) {
            if (i == 0 || w == 0) K[i][w] = 0;
            else if (wt[i - 1] <= w) K[i][w] = Math.max(val[i - 1] + K[i - 1][w - wt[i - 1]], K[i - 1][w]);
            else K[i][w] = K[i - 1][w];
        }
    }

    let res = K[n][W];
    w = W;
    for (i = n; i > 0 && res > 0; i--) {
        if (res == K[i - 1][w]) continue;
        else {
            results.push({
                weight: wt[i - 1],
                value: val[i - 1],
            });

            res = res - val[i - 1];
            w = w - wt[i - 1];
        }
    }
    return results;
};

//wt = time; value = percentile
export const youtubeVideosKnapsack = (W: number, wt: YoutubeVideo[], val: number[], n: number): YoutubeKnapsackResponse[] => {
    let results: YoutubeKnapsackResponse[] = [];

    let i: number, w: number;
    let K: number[][] = new Array(n + 1);
    for (i = 0; i < K.length; i++) {
        K[i] = new Array(W + 1);
        for (let j = 0; j < W + 1; j++) {
            K[i][j] = 0;
        }
    }

    for (i = 0; i <= n; i++) {
        for (w = 0; w <= W; w++) {
            if (i == 0 || w == 0) K[i][w] = 0;
            else if (wt[i - 1].stats.duration <= w) {
                K[i][w] = Math.max(val[i - 1] + K[i - 1][w - wt[i - 1].stats.duration], K[i - 1][w])
            }else { 
                K[i][w] = K[i - 1][w]
            };
        }
    }

    let res = K[n][W];

    w = W;

    for (i = n; i > 0 && res > 0; i--) {
        if (res == K[i - 1][w]) {
            continue;
        }else {
            res = res - val[i - 1];
            w = w - wt[i - 1].stats.duration;

            results.push({ // if (w < 0) break; //i put the condition here..but not sure if its the right way   
                video: wt[i - 1],
                duration: wt[i - 1].stats.duration,
                value: val[i - 1],
            });
        }
    }
    return results;
};