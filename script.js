let idCounter = 0;
let selectedElement = null;

document.querySelectorAll('.draggable').forEach(el => {
    el.addEventListener('dragstart', e => {
        e.dataTransfer.setData("type", e.target.dataset.type);
    });
});

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files.length && files[0].type.startsWith('image/')) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = createElement('image');
            img.src = event.target.result;
            img.style.left = e.offsetX + 'px';
            img.style.top = e.offsetY + 'px';
            document.getElementById('canvas').appendChild(img);
        };
        reader.readAsDataURL(file);
        return;
    }

    const type = e.dataTransfer.getData("type");
    const el = createElement(type);
    el.style.left = e.offsetX + 'px';
    el.style.top = e.offsetY + 'px';
    e.target.appendChild(el);
}

function createElement(type) {
    const id = 'el-' + (++idCounter);
    const el = document.createElement(type === 'image' ? 'img' : type === 'text' ? 'div' : 'button');
    el.classList.add('element');
    el.id = id;
    el.setAttribute('onclick', 'selectElement(event)');
    el.setAttribute('tabindex', '0');
    el.style.position = 'absolute';
    el.style.padding = '0.5rem';

    if (type === 'text') el.innerText = 'Edit Me';
    if (type === 'button') el.innerText = 'Click Me';
    if (type === 'image') {
        el.src = 'https://via.placeholder.com/150';
        el.style.width = '150px';
    }
    return el;
}

function selectElement(e) {
    e.stopPropagation();
    if (selectedElement) selectedElement.classList.remove('selected');
    selectedElement = e.target;
    selectedElement.classList.add('selected');
    populateEditor(selectedElement);
}

function populateEditor(el) {
    document.getElementById('selected-id').value = el.id;
    document.getElementById('prop-text').value = el.innerText || '';
    document.getElementById('prop-font-size').value = parseInt(window.getComputedStyle(el).fontSize) || '';
    document.getElementById('prop-color').value = rgbToHex(window.getComputedStyle(el).color);
    document.getElementById('prop-bg').value = rgbToHex(window.getComputedStyle(el).backgroundColor);
    document.getElementById('prop-src').value = el.tagName === 'IMG' ? el.src : '';
}

function updateProperties(e) {
    e.preventDefault();
    const id = document.getElementById('selected-id').value;
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = el.tagName !== 'IMG' ? document.getElementById('prop-text').value : '';
    el.style.fontSize = document.getElementById('prop-font-size').value + 'px';
    el.style.color = document.getElementById('prop-color').value;
    el.style.backgroundColor = document.getElementById('prop-bg').value;
    if (el.tagName === 'IMG') el.src = document.getElementById('prop-src').value;
}

function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#ffffff';
    const result = rgb.match(/\d+/g);
    return result ? '#' + result.map(x => (+x).toString(16).padStart(2, '0')).join('') : '#ffffff';
}

document.getElementById('prop-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file || !selectedElement || selectedElement.tagName !== 'IMG') return;

    const reader = new FileReader();
    reader.onload = function (event) {
        selectedElement.src = event.target.result;
        document.getElementById('prop-src').value = event.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('canvas').addEventListener('click', () => {
    if (selectedElement) selectedElement.classList.remove('selected');
    selectedElement = null;
});