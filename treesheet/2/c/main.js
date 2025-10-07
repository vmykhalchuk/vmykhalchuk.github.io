
// Main canvas rendering
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d');
const editableBox = document.getElementById('editableBox');
const canvasContainer = document.getElementById('canvasContainer');

const vScrollProxy = document.getElementById('vScrollProxy');
const contentHeight = 2000; // Set your virtual canvas height
let scrollY = 0;

// Sync proxy scroll to canvas scroll
vScrollProxy.addEventListener('scroll', () => {
  //scrollY = vScrollProxy.scrollTop;
  scrollY = canvasContainer.scrollTop;
  renderMainCanvas();
  renderEditableBox();
});

// Redirect canvas wheel events to proxy
mainCanvas.addEventListener('wheel', e => {
  //vScrollProxy.scrollTop += e.deltaY;
  canvasContainer.scrollTop += e.deltaY;
  e.preventDefault();
});

function renderMainCanvas() {
  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  const scrollLeft = canvasContainer.scrollLeft;
  
  for (var i = 0; i < 10; i++) {
    const dy = 80*i;
    {
      // line
      ctx.save();
      ctx.strokeStyle = "#0077cc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100 + scrollLeft, 100+dy - scrollY);
      ctx.lineTo(400 + scrollLeft, 200+dy - scrollY);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    {
      // circle
      ctx.save();
      ctx.fillStyle = "#cc3300";
      ctx.beginPath();
      ctx.arc(500, 150+dy - scrollY, 30, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    {
      // text
      const x = 300, y = 400+dy - scrollY;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x+20, 0, mainCanvas.width-(x+20), mainCanvas.height);
      ctx.closePath();
      ctx.clip();
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#000';
      ctx.fillText("Hello world!", x, y);
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
