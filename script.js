// Link UI Elements
const sizeRange = document.getElementById('sizeRange');
const radiusRange = document.getElementById('radiusRange');
const centerRange = document.getElementById('centerRange');

const sizeVal = document.getElementById('sizeVal');
const radiusVal = document.getElementById('radiusVal');
const centerVal = document.getElementById('centerVal');
const downloadBtn = document.getElementById('downloadBtn');

// Dynamic UI labels update
sizeRange.addEventListener('input', () => sizeVal.innerText = sizeRange.value + 'mm');
radiusRange.addEventListener('input', () => radiusVal.innerText = radiusRange.value + 'mm');
centerRange.addEventListener('input', () => centerVal.innerText = centerRange.value + 'mm');

// Vector DXF generation sequence
downloadBtn.addEventListener('click', () => {
    const size = parseFloat(sizeRange.value);
    const fillet = parseFloat(radiusRange.value);
    const centerRad = parseFloat(centerRange.value);

    // Initializing the browser DXF instance
    const d = new DxfWriter();
    
    // Create dedicated engineering layers
    d.addLayer('Outer_Cut', DxfWriter.VPORT_COLOR_GREEN, 'CONTINUOUS');
    d.addLayer('Inner_Engrave', DxfWriter.VPORT_COLOR_RED, 'CONTINUOUS');

    // Calculate coordinate box bounds centered around (0,0) origin
    const half = size / 2;

    d.setCurrentLayer('Outer_Cut');
    
    if (fillet === 0) {
        // Draw a simple perfect sharp rectangle layout
        d.drawRectangle(-half, -half, half, half);
    } else {
        // Draw a rounded rectangle using individual lines and tangent arcs
        // Top edge line
        d.drawLine(-half + fillet, half, half - fillet, half);
        // Top-right corner arc
        d.drawArc(half - fillet, half - fillet, fillet, 0, 90);
        // Right edge line
        d.drawLine(half, half - fillet, half, -half + fillet);
        // Bottom-right corner arc
        d.drawArc(half - fillet, -half + fillet, fillet, 270, 360);
        // Bottom edge line
        d.drawLine(half - fillet, -half, -half + fillet, -half);
        // Bottom-left corner arc
        d.drawArc(-half + fillet, -half + fillet, fillet, 180, 270);
        // Left edge line
        d.drawLine(-half, -half + fillet, -half, half - fillet);
        // Top-left corner arc
        d.drawArc(-half + fillet, half - fillet, fillet, 90, 180);
    }

    // Draw central geometric detail circle layer
    d.setCurrentLayer('Inner_Engrave');
    d.drawCircle(0, 0, centerRad);
    // Draw an accent layout crosshair pattern inside the circle
    d.drawLine(-5, 0, 5, 0);
    d.drawLine(0, -5, 0, 5);

    // Build vector string and compile browser download stream
    const dxfOutputString = d.toDxfString();
    const blob = new Blob([dxfOutputString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cnc_coaster_${size}mm.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
