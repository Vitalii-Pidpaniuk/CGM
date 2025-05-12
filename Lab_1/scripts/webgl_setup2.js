function setupWebGL() {
    const canvas = document.getElementById("mycanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("WebGL не підтримується вашим браузером.");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.99, 0.99, 0.9, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShaderSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelViewMatrix;
        varying lowp vec4 vColor;
        void main(void) {
            gl_Position = uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    const fragmentShaderSource = `
        varying lowp vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    const vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');

    const circleVertices = [];
    const segments = 30;
    const radius = 0.25;
    const verticalMovementSpeed = 0.01;

    circleVertices.push(0.0, 0.0, 0.0);

    for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        circleVertices.push(x, y, 0.0);
    }

    const circleVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);

    const circleColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleColorBuffer);

    const circleColors = new Float32Array((segments + 2) * 4);
    for (let i = 0; i < circleColors.length; i += 4) {
        circleColors[i] = 0.3; // R
        circleColors[i + 1] = 0.3; // G
        circleColors[i + 2] = 1.0; // B
        circleColors[i + 3] = 1.0; // A
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, circleColors, gl.STATIC_DRAW);

    let verticalMovement = 0.0;
    let direction = 1;

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        const circleModelViewMatrix = mat4.create();
        mat4.translate(circleModelViewMatrix, circleModelViewMatrix, [0.0, verticalMovement, 0.0]);
        gl.uniformMatrix4fv(uModelViewMatrix, false, circleModelViewMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPositionAttribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, circleColorBuffer);
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexColorAttribute);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertices.length / 3);

        verticalMovement += verticalMovementSpeed * direction;
        if (verticalMovement > 0.5 || verticalMovement < -0.5) {
            direction *= -1; 
        }

        requestAnimationFrame(drawScene);
    }

    drawScene();
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Помилка компіляції шейдера:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Помилка лінкування програми:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

window.onload = setupWebGL;
