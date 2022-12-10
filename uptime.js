//@ts-check



const { readFileSync, writeFileSync } = require("fs");
const file = readFileSync("./pm2.log", "utf8");
//2019-04-17T03:33:42: PM2 log: App [TiddlyServer:1] online
const reg = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}): PM2 log: App \[([^\]]*)\:\d+] (.*)$/;

const res = {}

let cur = {};
let max = {};

file.split("\n").map(e => {
    const match = reg.exec(e);
    if (!match) return;
    const [, time, app, event] = match;
    const time2 = new Date(time);
    const date = time.substring(0, 10);
    // console.log(app, event);
    if (!res[app]) res[app] = {};
    if (!res[app][date]) res[app][date] = 0;
    if (!cur[app]) cur[app] = {};
    if (!max[app]) max[app] = 0;
    // if (!res[app][event]) res[app][event] = [];


    if (event.startsWith("online")) {
        cur[app].start = time;
    } else if (event.startsWith("exited")) {
        cur[app].end = time;
        let diff = (new Date(cur[app].end).valueOf() - new Date(cur[app].start).valueOf());
        if (cur[app].start && cur[app].end) {
            res[app][date] += diff; //.push({ start: cur[app].start, length: diff });
            max[app] = Math.max(max[app], res[app][date])
        }
        cur[app] = {};
    }
});
if (!process.argv[2]){
    console.log("Syntax: node uptime [app]")
    console.log("App: ", Object.keys(res).join(", "))
} else {
    makeBarGraph(process.argv[2]);
}

function makeBarGraph(key) {
    let data = res[key];
    let m = max[key];
    // writeFileSync("output.json", JSON.stringify(res[key], null, 2));
    writeFileSync("chart.txt", Object.keys(data).map(k => {
        const part = data[k] / m;
        const len = Math.round(part * 60);
        return `${k} - ${part.toFixed(2)}: ${"=".repeat(len)}${" ".repeat(60-len)}|`;
    }).join('\n'));
}
