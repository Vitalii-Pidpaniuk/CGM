const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL не підтримується вашим браузером.');
}

gl.clearColor(1.0, 1.0, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const vertices = new Float32Array([
    -0.6, 0.8,   
    -0.1, -0.8,
    -0.4, 0.8,

    -0.4, 0.8,
    -0.1, -0.8,
    0.1, -0.8,

    0.1, -0.8,
    -0.1, -0.8,
    0.4, 0.8,

    0.4, 0.8,
    0.6, 0.8,
    0.1, -0.8,
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const vertexShaderSource = `
    attribute vec2 coordinates;
    uniform mat4 rotationMatrix;
    void main(void) {
        gl_Position = rotationMatrix * vec4(coordinates, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 color;
    void main(void) {
        gl_FragColor = color; // Колір літери
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const coord = gl.getAttribLocation(shaderProgram, "coordinates");
gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(coord);

const colorLocation = gl.getUniformLocation(shaderProgram, "color");
const rotationMatrixLocation = gl.getUniformLocation(shaderProgram, "rotationMatrix");

const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', function() {
    const hexColor = colorPicker.value;
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    gl.uniform4fv(colorLocation, [r, g, b, 1.0]);
});

let angle = 0;

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    angle += 0.01;
    const rotationMatrix = [
        Math.cos(angle), Math.sin(angle), 0.0, 0.0,
        -Math.sin(angle), Math.cos(angle), 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    gl.uniformMatrix4fv(rotationMatrixLocation, false, new Float32Array(rotationMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
    requestAnimationFrame(draw);
}

draw();