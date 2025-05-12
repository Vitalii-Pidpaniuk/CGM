const canvas = document.getElementById('mycanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert("WebGL не підтримується в цьому браузері");
}

const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform mat4 u_matrix;

    void main() {
        gl_Position = u_matrix * a_position;
        v_color = a_color;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const positions = [
    -0.2, -0.2,  0.2,
     0.2, -0.2,  0.2,
     0.2,  0.2,  0.2,
    -0.2, -0.2,  0.2,
     0.2,  0.2,  0.2,
    -0.2,  0.2,  0.2,

    -0.2, -0.2, -0.2,
     0.2, -0.2, -0.2,
     0.2,  0.2, -0.2,
    -0.2, -0.2, -0.2,
     0.2,  0.2, -0.2,
    -0.2,  0.2, -0.2,

    -0.2,  0.2,  0.2,
     0.2,  0.2,  0.2,
     0.2,  0.2, -0.2,
    -0.2,  0.2,  0.2,
     0.2,  0.2, -0.2,
    -0.2,  0.2, -0.2,

    -0.2, -0.2,  0.2,
     0.2, -0.2,  0.2,
     0.2, -0.2, -0.2,
    -0.2, -0.2,  0.2,
     0.2, -0.2, -0.2,
    -0.2, -0.2, -0.2,

    -0.2, -0.2,  0.2,
    -0.2,  0.2,  0.2,
    -0.2,  0.2, -0.2,
    -0.2, -0.2,  0.2,
    -0.2,  0.2, -0.2,
    -0.2, -0.2, -0.2,

     0.2, -0.2,  0.2,
     0.2,  0.2,  0.2,
     0.2,  0.2, -0.2,
     0.2, -0.2,  0.2,
     0.2,  0.2, -0.2,
     0.2, -0.2, -0.2
];

const faceColors = [
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 0.5, 0.0, 1.0],
    [0.5, 0.5, 0.5, 1.0] 
].flatMap(color => Array(6).fill(color).flat());


const linePositions = [
    -0.2, -0.2,  0.2,
     0.2, -0.2,  0.2,
     0.2,  0.2,  0.2,
    -0.2,  0.2,  0.2,

    -0.2, -0.2, -0.2,
     0.2, -0.2, -0.2,
     0.2,  0.2, -0.2,
    -0.2,  0.2, -0.2,

    -0.2, -0.2,  0.2,
    -0.2, -0.2, -0.2,
     0.2, -0.2,  0.2,
     0.2, -0.2, -0.2,
     0.2,  0.2,  0.2,
     0.2,  0.2, -0.2,
    -0.2,  0.2,  0.2,
    -0.2,  0.2, -0.2,
];

const edgeColors = new Array(24).fill([0.0, 0.0, 0.0, 1.0]).flat();

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faceColors), gl.STATIC_DRAW);

const lineBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePositions), gl.STATIC_DRAW);

const lineColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(edgeColors), gl.STATIC_DRAW);

function setAttribute(buffer, attribute, size) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const location = gl.getAttribLocation(program, attribute);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

const fieldOfViewRadians = Math.PI / 4;
const aspect = canvas.width / canvas.height;
const zNear = 0.1;
const zFar = 100.0;
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, zNear, zFar);

let rotationY = 0;
function drawScene() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    rotationY += 0.01;

    const modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [0, 0, -2]);
    mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 9);
    mat4.rotateY(modelMatrix, modelMatrix, rotationY);

    const mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, projectionMatrix, modelMatrix);

    gl.useProgram(program);
    setAttribute(positionBuffer, 'a_position', 3);
    setAttribute(colorBuffer, 'a_color', 4);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);

    setAttribute(lineBuffer, 'a_position', 3);
    setAttribute(lineColorBuffer, 'a_color', 4);
    gl.drawArrays(gl.LINES, 0, linePositions.length / 3);

    requestAnimationFrame(drawScene);
}

requestAnimationFrame(drawScene);
