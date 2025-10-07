
let scrollX = 0, scrollY = 0;
const contentWidth = 5000, contentHeight = 5000; // Example content size

const canvasContainer = document.getElementById('canvasContainer');
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d');
const editableBox = document.getElementById('editableBox');

// Make sure canvas size always matches container size
function resizeCanvas() {
  mainCanvas.width = canvasContainer.clientWidth;
  mainCanvas.height = canvasContainer.clientHeight;
  renderMainCanvas();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Scroll controls
document.addEventListener('keydown', function(e) {
  const step = 50;
  if (e.key === 'ArrowRight') scrollX += step;
  if (e.key === 'ArrowLeft') scrollX -= step;
  if (e.key === 'ArrowDown') scrollY += step;
  if (e.key === 'ArrowUp') scrollY -= step;
  renderMainCanvas();
});

const hScrollbar = document.getElementById('hScrollbar');
const vScrollbar = document.getElementById('vScrollbar');

function updateScrollbars() {
  const cw = canvasContainer.clientWidth;
  const ch = canvasContainer.clientHeight;
  // Horizontal
  const hThumbW = Math.max(cw * cw / contentWidth, 40);
  const hThumbL = scrollX * cw / contentWidth;
  hScrollbar.innerHTML = '<div class="scrollbar-thumb" style="width:${hThumbW}px; left:${hThumbL}px;"></div>';
  // Vertical
  const vThumbH = Math.max(ch * ch / contentHeight, 40);
  const hThumbT = scrollY * ch / contentHeight;
  vScrollbar.innerHTML = '<div class="scrollbar-thumb" style="height:${vThumbH}px; top:${vThumbT}px;"></div>';
}
function setScroll(x, y) {
  scrollX = Math.max(0, Math.min(contentWidth - canvasContainer.clientWidth, x));
  scrollY = Math.max(0, Math.min(contentHeight - canvasContainer.clientHeight, y));
  renderMainCanvas();
  renderEditableBox();
  // renderSidebarCanvas();
  updateScrollbars();
}

// Drag logic
let dragging = null, dragStart = 0, scrollStart = 0;
hScrollbar.addEventListener('mousedown', e => {
  if (e.target.classList.contains('scroll-thumb')) {
    dragging = 'h';
    dragStart = e.clientX;
    scrollStart = scrollX;
    document.body.style.userSelect = 'none';
  }
});
vScrollbar.addEventListener('mousedown', e => {
  if (e.target.classList.contains('scroll-thumb')) {
    dragging = 'v';
    dragStart = e.clientY;
    scrollStart = scrollY;
    document.body.style.userSelect = 'none';
  }
});
window.addEventListener('mousemove', e => {
  if (dragging === 'h') {
    const cw = canvasContainer.clientWidth;
    const dx = e.clientX - dragStart;
    const maxScroll = contentWidth - cw;
    setScroll(scrollStart + dx * contentWidth / cw, scrollY);
  } else if (dragging === 'v') {
    const ch = canvasContainer.clientHeight;
    const dy = e.clientY - dragStart;
    const maxScroll = contentHeight - ch;
    setScroll(scrollX, scrollStart + dy * contentHeight / ch);
  }
});
window.addEventListener('mouseup', e => {
  dragging = null;
  document.body.style.userSelect = '';
});
updateScrollbars();
setScroll(0,0);
window.addEventListener('resize', updateScrollbars);



function renderMainCanvas() {
  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  const scrollLeft = canvasContainer.scrollLeft;
  
  for (var i = 0; i < 100; i++) {
    const dy = 80*i;
    {
      // line
      ctx.save();
      ctx.strokeStyle = "#0077cc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100 + scrollLeft - scrollX, 100+dy - scrollY);
      ctx.lineTo(400 + scrollLeft - scrollX, 200+dy - scrollY);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    {
      // circle
      ctx.save();
      ctx.fillStyle = "#cc3300";
      ctx.beginPath();
      ctx.arc(500 - scrollX, 150+dy - scrollY, 30, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    {
      // text
      const x = 300 - scrollX, y = 400+dy - scrollY;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x+20, 0, mainCanvas.width-(x+20), mainCanvas.height);
      ctx.closePath();
      ctx.clip();
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#000';
      ctx.fillText("Hello world!", x, y+dy);
      ctx.restore();
    }
  }
}

function renderEditableBox() {
  const inst = { x: 200, y: 300, w: 200, h: 30};
  if (inst) {
    editableBox.style.display = 'block';
    editableBox.style.left = inst.x + 'px';
    editableBox.style.top = inst.y + 'px';
    editableBox.style.width = inst.w + 'px';
    editableBox.style.height = inst.h + 'px';
    editableBox.value = "Simple text here";
  } else {
    editableBox.style.display = 'none';
  }
}

// Re-render canvas on scroll
canvasContainer.addEventListener('scroll', () => {
  renderMainCanvas();
  renderEditableBox();
  // renderSidebarCanvas();
});

// Initial render
renderMainCanvas();
renderEditableBox();
// renderSidebarCanvas();
