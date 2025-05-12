function setupWebGL()
{
  const canvas = document.getElementById("mycanvas");
  
  const gl = canvas.getContext("webgl");

  if (!gl) 
  {
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

   // Позиції (x, y, z) та кольори (r, g, b, a) для вершини двох трикутників (квадрат)
   const vertices = new Float32Array([
    -0.5,  0.5,  0.0,  1.0,  0.0,  0.0,  1.0,
    -0.5, -0.5,  0.0,  0.0,  1.0,  0.0,  1.0,
     0.5, -0.5,  0.0,  0.0,  0.0,  1.0,  1.0,
    
    -0.5,  0.5,  0.0,  1.0,  0.0,  0.0,  1.0,
     0.5,  0.5,  0.0,  1.0,  1.0,  0.0,  1.0,
     0.5, -0.5,  0.0,  0.0,  0.0,  1.0,  1.0 
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 28, 0);
  gl.enableVertexAttribArray(vertexPositionAttribute);

  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 28, 12);
  gl.enableVertexAttribArray(vertexColorAttribute);

  let rotation = 0;

  function drawScene()
  {
    gl.clear(gl.COLOR_BUFFER_BIT);

    const ModelViewMatrix = mat4.create();
    mat4.translate(ModelViewMatrix, ModelViewMatrix, [0.0, 0.0, 0.0]);
    mat4.rotate(ModelViewMatrix, ModelViewMatrix, rotation, [0, 0, 1]);

    gl.uniformMatrix4fv(uModelViewMatrix, false, ModelViewMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    rotation += 0.01;

    requestAnimationFrame(drawScene);
  }

  drawScene();
}

function createShader(gl, type, source)
{
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
    console.error('Помилка компіляції шейдера:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader)
{
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
  {
    console.error('Помилка лінкування програми:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

window.onload = setupWebGL;