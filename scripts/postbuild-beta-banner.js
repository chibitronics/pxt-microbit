const fs = require("fs");
const path = require("path");

const indexPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, "..", "built", "packaged", "index.html");

if (!fs.existsSync(indexPath)) {
    console.warn(`[beta-banner] ${indexPath} not found; skipping`);
    process.exit(0);
}

let html = fs.readFileSync(indexPath, "utf8");

const headMarker = "<!-- chibi-beta-banner-head -->";
const bodyMarker = "<!-- chibi-beta-banner-body -->";

if (!html.includes(headMarker)) {
    const headInjection = `${headMarker}
    <link id="chibi-beta-banner-font" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&amp;display=swap">
    <style id="chibi-beta-banner-style">
        #chibi-beta-banner {
            width: 100%;
            box-sizing: border-box;
            padding: 0.45rem 1rem;
            min-height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 1rem;
            line-height: 1.25;
            font-family: "Lexend", "Helvetica", sans-serif;
            font-weight: 700;
            letter-spacing: 0.01em;
            background: #f3003f;
            color: #ffffff;
            border-bottom: 1px solid #c90035;
            box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
            position: relative;
            z-index: 1000;
        }
        #chibi-beta-banner a {
            color: inherit;
            font-weight: 700;
            text-decoration: none;
        }
        #chibi-beta-banner a:hover,
        #chibi-beta-banner a:focus {
            color: #000000;
            text-decoration: none;
        }
    </style>`;

    html = html.replace("</head>", `${headInjection}\n</head>`);
}

if (!html.includes(bodyMarker)) {
    const bodyInjection = `${bodyMarker}
    <div id="chibi-beta-banner" role="status">This app is in Beta mode, and features may change! Feedback or issues? Contact us at&nbsp;<a href="mailto:research@chibitronics.com">research@chibitronics.com</a></div>`;

    html = html.replace("    <div id='custom-content'>", `${bodyInjection}\n\n    <div id='custom-content'>`);
}

fs.writeFileSync(indexPath, html);
console.log(`[beta-banner] injected into ${indexPath}`);
