// src/popup.ts
console.log('Popup script loaded');

// Example: manipulate the DOM or do something on popup open
const heading = document.querySelector('h1');
if (heading) {
    heading.addEventListener('click', () => {
        alert('You clicked the popup heading!');
    });
}
