function setupUserInteraction() {
  const canvas = document.getElementById('mycanvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
      alert("Ваш браузер не підтримує WebGL");
      return;
  }

  let drawMode = 'points';
  let points = [];
  let triangles = [];
  let circles = [];
  let selectedColor = [1.0, 0.0, 0.0, 1.0];
  let firstClick = false;
  let circleCenter = null;
  const circleVerticesCount = 30;

  const clearBtn = document.getElementById('clearBtn');
  const drawPointsBtn = document.getElementById('drawPointsBtn');
  const drawTrianglesBtn = document.getElementById('drawTrianglesBtn');
  const drawCircleBtn = document.getElementById('drawCircleBtn');
  const colorPicker = document.getElementById('colorPicker');
  const bgColorPicker = document.getElementById('bgColorPicker');

  const vertexShaderSource = `
      attribute vec4 aPosition;
      attribute vec4 aColor;
      varying lowp vec4 vColor;
      void main(void) {
          gl_Position = aPosition;
          gl_PointSize = 5.0;
          vColor = aColor;
      }
  `;

  const fragmentShaderSource = `
      precision mediump float;
      varying lowp vec4 vColor;
      void main(void) {
          gl_FragColor = vColor;
      }
  `;

  function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Помилка компіляції шейдера', gl.getShaderInfoLog(shader));
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
          console.error('Помилка лінкування програми', gl.getProgramInfoLog(program));
          gl.deleteProgram(program);
          return null;
      }
      return program;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const aColor = gl.getAttribLocation(program, 'aColor');
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  colorPicker.addEventListener('input', (event) => {
      const hexColor = event.target.value;
      selectedColor = hexToRgbA(hexColor);
  });

  bgColorPicker.addEventListener('input', (event) => {
      const hexBgColor = event.target.value;
      const [r, g, b] = hexToRgb(hexBgColor);
      gl.clearColor(r, g, b, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
  });

  function hexToRgbA(hex) {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b, 1.0];
  }

  function hexToRgb(hex) {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
  }

  canvas.addEventListener('mousedown', (event) => {
      const rect = event.target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / canvas.height) * -2 + 1;

      if (drawMode === 'points') {
          points.push(x, y, ...selectedColor);
      } else if (drawMode === 'triangles') {
          points.push(x, y, ...selectedColor);
          if (points.length >= 18) {
              triangles.push(...points.splice(0, 18));
          }
      } else if (drawMode === 'circle') {
          if (!firstClick) {
              circleCenter = [x, y];
              firstClick = true;
          } else {
              const radius = Math.sqrt(Math.pow(x - circleCenter[0], 2) + Math.pow(y - circleCenter[1], 2));
              let newCircle = [circleCenter[0], circleCenter[1], ...selectedColor];
              for (let i = 0; i <= circleVerticesCount; i++) {
                  const angle = (i / circleVerticesCount) * Math.PI * 2;
                  const circleX = circleCenter[0] + Math.cos(angle) * radius;
                  const circleY = circleCenter[1] + Math.sin(angle) * radius;
                  newCircle.push(circleX, circleY, ...selectedColor);
              }
              circles.push(newCircle);
              firstClick = false;
          }
      }

      drawScene();
  });

  drawPointsBtn.addEventListener('click', () => {
      drawMode = 'points';
      firstClick = false; 
  });

  drawTrianglesBtn.addEventListener('click', () => {
      drawMode = 'triangles';
      firstClick = false; 
  });

  drawCircleBtn.addEventListener('click', () => {
      drawMode = 'circle';
      firstClick = false; 
  });

  clearBtn.addEventListener('click', () => {
      points = [];
      triangles = [];
      circles = [];
      gl.clear(gl.COLOR_BUFFER_BIT);
  });

  function drawScene() {
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (points.length > 0) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
          gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 24, 0);
          gl.enableVertexAttribArray(aPosition);

          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
          gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 24, 8);
          gl.enableVertexAttribArray(aColor);

          gl.drawArrays(gl.POINTS, 0, points.length / 6);
      }

      if (triangles.length > 0) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles), gl.STATIC_DRAW);
          gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 24, 0);
          gl.enableVertexAttribArray(aPosition);

          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles), gl.STATIC_DRAW);
          gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 24, 8);
          gl.enableVertexAttribArray(aColor);

          gl.drawArrays(gl.TRIANGLES, 0, triangles.length / 6);
      }

      if (circles.length > 0) {
          circles.forEach(circle => {
              gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);
              gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 24, 0);
              gl.enableVertexAttribArray(aPosition);

              gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
              gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circle), gl.STATIC_DRAW);
              gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 24, 8);
              gl.enableVertexAttribArray(aColor);

              const numVertices = circleVerticesCount + 2;
              gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertices);
          });
      }
  }

  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

window.onload = setupUserInteraction;
