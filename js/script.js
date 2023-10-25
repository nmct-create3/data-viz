const $legendEl = document.querySelector(`.js-legend`);
const $chartEl = document.querySelector(`.js-chart`);
const $controlsEl = document.querySelector(`.js-controls`);
const $toggleEl = document.querySelector(`.js-theme-toggle`);
let data;

// SVG drawing functions

const cos = Math.cos;
const sin = Math.sin;
const π = Math.PI;

const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
const f_rotate_matrix = (x => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

const drawArc = (([cx, cy], [rx, ry], [t1, Δ], φ,) => {
    /* [
    returns a SVG path element that represent a ellipse.
    cx,cy → center of ellipse
    rx,ry → major minor radius
    t1 → start angle, in radian.
    Δ → angle to sweep, in radian. positive.
    φ → rotation on the whole, in radian
    Based on:
    URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
    Version 2019-06-19
     ] */
    // convert t1 from degree to radian
    t1 = t1 / 360 * 2 * π;
    // convert Δ from degree to radian
    Δ = Δ / 360 * 2 * π;
    Δ = Δ % (2 * π);
    const rotMatrix = f_rotate_matrix(φ);
    const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
    const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]), [cx, cy]));
    const fA = ((Δ > π) ? 1 : 0);
    const fS = ((Δ > 0) ? 1 : 0);
    const d = `M ${sX} ${sY} A ${[rx, ry, φ / (2 * π) * 360, fA, fS, eX, eY].join(" ")}`;
    return d;
});

// const renderChart = obj => {
//     const $svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
//     $svg.setAttribute(`width`, `400`);
//     $svg.setAttribute(`height`, `400`);
//     $svg.setAttribute(`viewBox`, `0 0 400 400`);
//     $svg.setAttribute(`fill`, `none`);
//     $svg.classList.add(`chart`);
//     document.body.appendChild($svg);
//     // add to the output
//     $chartEl.appendChild($svg);

//     // draw the different paths
//     const keys = data[obj].parties;
//     // for each key in the keys object, draw a path
//     Object.keys(keys).forEach((key, i) => {
//         // const $path = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
//         // draw a circle
//         const $path = document.createElementNS(`http://www.w3.org/2000/svg`, `circle`);
//         $path.setAttribute(`cx`, `200`);
//         $path.setAttribute(`cy`, `200`);
//         $path.setAttribute(`r`, `150`);
//         $path.setAttribute(`class`, `chart__path`);
//         $path.setAttribute(`stroke-width`, 100);
//         $path.setAttribute(`id`, `chart__path--${key}`);
//         $path.style.setProperty(`--strokeColor`, `var(--color-${i + 1})`);
//         // add it to the svg in the back
//         $svg.insertBefore($path, $svg.firstChild);
//     });
// }

const renderChart = obj => {
    const $svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
    $svg.setAttribute(`width`, `400`);
    $svg.setAttribute(`height`, `200`);
    $svg.setAttribute(`viewBox`, `0 0 400 200`);
    $svg.setAttribute(`fill`, `none`);
    $svg.classList.add(`chart`);
    document.body.appendChild($svg);
    // add to the output
    $chartEl.appendChild($svg);

    // draw the different paths
    const keys = data[obj].ages;
    // rewrite without the name parties
    // const keys = Object.values(data);

    // for each key in the keys object, draw a path
    Object.keys(keys).forEach((key, i) => {
        const $path = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
        $path.setAttribute(`class`, `chart__path`);
        $path.setAttribute(`stroke-width`, 50);
        $path.setAttribute(`id`, `chart__path--${i}`);
        $path.style.setProperty(`--strokeColor`, `var(--color-${i + 1})`);
        $path.setAttribute(`d`, drawArc([200, 200], [175, 175], [180, 180], 0));
        // $svg.appendChild($path);
        // add it to the svg in the back
        $svg.insertBefore($path, $svg.firstChild);
    });
}

const updatePaths = keys => {
    // let sweep = 0;
    // let $path;
    // Object.keys(keys).forEach(key => {
    //     $path = document.querySelector(`#chart__path--${key}`);
    //     const length = 180;
    //     gap = 2;
    //     keys[key] = keys[key].replace(",", ".");
    //     const percentage = parseFloat(keys[key]) / 100;
    //     const pathLength = length * percentage;
    //     $path.setAttribute(`d`, drawArc([200, 200], [150, 150], [length + sweep, pathLength], 0));
    //     sweep += pathLength + gap;
    // });

    let totalOffset = 0;
    Object.keys(keys).forEach((key, i) => {
        const $path = document.querySelector(`#chart__path--${i}`);
        const length = $path.getTotalLength();
        const gap = 0;
        $path.setAttribute(`pathLength`, length);
        $path.style.setProperty(`--path-length`, length);
        keys[key] = keys[key].replace(",", ".");
        const percentage = parseFloat(keys[key]) / 100;
        const dasharray = length * percentage;
        $path.style.setProperty(`--stroke-dasharray`, dasharray);
        $path.style.setProperty(`--stroke-dashoffset`, totalOffset * -1);
        totalOffset += dasharray + gap;
    });
}

const renderLegend = obj => {
    const keys = data[obj].ages;
    $legendEl.innerHTML = ``;
    // $legendEl.innerHTML += `<h2>${obj}</h2>`;
    $legendEl.innerHTML += `<ul class="legend"></ul>`;
    const $legend = document.querySelector(`.legend`);
    $legend.innerHTML += Object.keys(keys).map((key, i) => {
        return `<li style="--legendColor: var(--color-${i + 1})" class="legend__item"><span class="legend__key">${key}</span> <span class="legend__value">${keys[key]}</span></li>`;
    }).join(``);

    updatePaths(keys);
}


const renderControls = data => {
    const $controls = document.createElement(`ul`);
    $controls.classList.add(`controls`);
    $controlsEl.appendChild($controls);
    // create a list item for each key in the data
    const keys = Object.keys(data);

    $controls.innerHTML += keys.map(key => {
        return `
        <li class="control">
            <label class="control__label">
                <input class="control__input sr-only" type="radio" name="control" value="${key}" />
                <span class="control__text">${key}</span>
            </label>
        </li>
        `
    }).join(``);

    // check the input of radio button that has the value of the first key
    const $firstInput = document.querySelector(`input[value="${keys[0]}"]`);
    $firstInput.checked = true;

    // add an event listener to the radio buttons to show the correct data
    const $radios = document.querySelectorAll(`.control__input`);
    $radios.forEach(radio => {
        radio.addEventListener(`change`, event => {
            renderLegend(event.target.value);
        });
    });

};

const getData = async () => {
    const jsonFile = `assets/data/data.json`;

    const response = await fetch(jsonFile);
    data = await response.json();

    renderControls(data);
    renderChart(Object.keys(data)[0]);
    renderLegend(Object.keys(data)[0]);
};

/* theme toggle */

const storageKey = 'theme-preference'

const changeThemePreference = () => {
    // flip current value
    theme.value = theme.value === 'light'
        ? 'dark'
        : 'light'

    setThemePreference()
}

const getThemePreference = () => {
    if (localStorage.getItem(storageKey))
        return localStorage.getItem(storageKey)
    else
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
}

const setThemePreference = () => {
    localStorage.setItem(storageKey, theme.value)
    reflectThemePreference()
}

const reflectThemePreference = () => {
    document.firstElementChild
        .setAttribute('data-theme', theme.value)

    document
        .querySelector('#theme-toggle')
        ?.setAttribute('aria-label', theme.value)
}

const theme = {
    value: getThemePreference(),
}

// set early so no page flashes / CSS is made aware
reflectThemePreference()

window.onload = () => {
    // set on load so screen readers can see latest value on the button
    reflectThemePreference()

    // now this script can find and listen for clicks on the control
    document
        .querySelector('.js-theme-toggle')
        .addEventListener('click', changeThemePreference)
}

const init = () => {
    getData();

    // reflectThemePreference()
    // now this script can find and listen for clicks on the control
    // $toggleEl.addEventListener(`click`, changeThemePreference);
};

init();

// sync with system changes
window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({ matches: isDark }) => {
        theme.value = isDark ? 'dark' : 'light'
        setThemePreference()
    })
