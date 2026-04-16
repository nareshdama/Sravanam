/** GLSL for Sri Yantra particle + tunnel background. Points use gl_PointCoord; vUv fixed (no uv attr on Points). */

export const sandVertexShader = `
  attribute float aScale;
  attribute vec3 aColor;
  attribute vec3 aTargetPosition;
  attribute vec3 aStartPosition;
  attribute float aPhase;

  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uExplosion;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uPulse;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vNoise;
  varying float vBuildAlpha;
  varying float vTunnelPhase;
  varying float vWorldZ;
  varying float vSparkAngle;
  varying float vHeat;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 getTunnelPosition(float baseAngle, float phase, float scale, float zOff, float twistScale) {
    float radius = 1.8 + fract(scale * 7.0) * 1.2;
    float baseZ = fract(phase * 13.37) * 26.0;
    float zPos = mod(baseZ + zOff, 26.0) - 20.0;
    float twist = zPos * 0.08 + uTime * 0.3 * twistScale;
    return vec3(cos(baseAngle + twist) * radius, sin(baseAngle + twist) * radius, zPos);
  }

  void main() {
    vUv = vec2(0.5);
    vColor = aColor;

    vSparkAngle = fract(aPhase * 47.13 + sin(dot(position.xy, vec2(12.9898, 78.233))) * 12.0) * 6.28318530718;
    vHeat = 0.28 + 0.72 * fract(aPhase * 91.7 + aScale * 6.2 + position.z * 31.0);

    float noise = snoise(position * 50.0 + uTime * 0.1);
    vNoise = noise;

    vec3 finalPosition;
    vTunnelPhase = 0.0;
    vBuildAlpha = 1.0;

    float baseAngle = atan(aTargetPosition.y, aTargetPosition.x);

    if (uScrollProgress < 0.5) {
      float t = uScrollProgress * 2.0;
      float staggerWindow = 0.3;
      float pStart = aPhase * staggerWindow;
      float pEnd = pStart + (1.0 - staggerWindow);
      float pT = clamp((t - pStart) / (pEnd - pStart), 0.0, 1.0);
      float easedPT = 1.0 - pow(1.0 - pT, 3.0);

      finalPosition = mix(aStartPosition, aTargetPosition, easedPT);
      vBuildAlpha = smoothstep(0.0, 0.15, pT);

    } else if (uScrollProgress < 0.75) {
      float t = (uScrollProgress - 0.5) / 0.25;
      float easedT = pow(t, 2.0);

      vec3 explosionDir = normalize(aTargetPosition + vec3(0.0001));
      float explosionDist = 15.0 * easedT * (1.0 + aPhase * 2.0);
      finalPosition = aTargetPosition + explosionDir * explosionDist;

      float spiralAngle = easedT * 3.14159 * 2.0;
      float cosS = cos(spiralAngle);
      float sinS = sin(spiralAngle);
      mat2 rot = mat2(cosS, -sinS, sinS, cosS);
      finalPosition.xz = rot * finalPosition.xz;

    } else if (uScrollProgress < 0.85) {
      float t = (uScrollProgress - 0.75) / 0.10;
      float easedT = t * t * (3.0 - 2.0 * t);

      vec3 explosionDir = normalize(aTargetPosition + vec3(0.0001));
      float explosionDist = 15.0 * (1.0 + aPhase * 2.0);
      vec3 explosionEnd = aTargetPosition + explosionDir * explosionDist;

      vec3 tunnelPos = getTunnelPosition(baseAngle, aPhase, aScale, 0.0, easedT);

      finalPosition = mix(explosionEnd, tunnelPos, easedT);
      vTunnelPhase = easedT;

    } else {
      float tunnelT = (uScrollProgress - 0.85) / 0.15;
      float easedTunnelT = tunnelT * tunnelT;
      finalPosition = getTunnelPosition(baseAngle, aPhase, aScale, easedTunnelT * 40.0, 1.0);
      vTunnelPhase = 1.0;
    }

    vWorldZ = finalPosition.z;

    float interactionMix = 1.0 - vTunnelPhase;
    float velocityBoost = uVelocity * 0.4;
    float pulseBoost = uPulse * 0.6;
    finalPosition.xy += uPointer * uHover * (0.06 + noise * 0.02) * interactionMix;
    finalPosition *= (1.0 + pulseBoost * 0.05 * interactionMix);

    finalPosition.y += sin(uTime * 0.3 + aPhase * 10.0) * (0.015 + velocityBoost * 0.03) * interactionMix;

    vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float sizeVar = 1.0 + noise * 0.2;
    float distance = max(1.0, -mvPosition.z);
    gl_PointSize = aScale * sizeVar * (1.0 + pulseBoost * 0.55) * (96.0 / distance);
  }
`

export const sandFragmentShader = `
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uPulse;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vNoise;
  varying float vBuildAlpha;
  varying float vTunnelPhase;
  varying float vWorldZ;
  varying float vSparkAngle;
  varying float vHeat;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float ca = cos(vSparkAngle);
    float sa = sin(vSparkAngle);
    vec2 rp = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    float aspect = 3.8 + vHeat * 2.4;
    vec2 stretch = vec2(rp.x * aspect, rp.y * (1.15 + hash(vec2(vNoise, vSparkAngle)) * 0.35));
    float d = length(stretch);

    float jagged = hash(gl_PointCoord * 19.0 + vNoise) * 0.07;
    if (d > 0.48 + jagged) discard;

    float core = exp(-d * d * 110.0);
    float body = smoothstep(0.5, 0.02, d);
    float alpha = (0.35 * body + 0.85 * core) * (0.88 + 0.12 * vHeat);

    float flicker = 0.72 + 0.28 * sin(uTime * (11.0 + vHeat * 18.0) + vNoise * 47.0);
    flicker *= 0.9 + 0.1 * sin(uTime * 37.3 + gl_PointCoord.x * 80.0);
    alpha *= flicker;

    vec3 hot = vec3(1.0, 0.98, 0.88);
    vec3 mid = vColor;
    vec3 cool = vColor * vec3(0.22, 0.06, 0.02);
    float t = clamp(d * 2.4, 0.0, 1.0);
    vec3 ember = mix(hot, mid, t);
    ember = mix(ember, cool, t * t * (0.35 + 0.65 * (1.0 - vHeat)));
    ember *= 0.85 + 0.35 * core;

    float glint = exp(-abs(rp.x * 14.0) - rp.y * rp.y * 90.0);
    ember += vec3(1.0, 0.92, 0.65) * glint * 0.85 * vHeat;

    float chip = step(0.992, hash(gl_PointCoord * 60.0 + vec2(vNoise, vHeat)));
    ember += vec3(1.0, 0.95, 0.8) * chip * 0.45;

    vec3 finalColor = ember;

    float interactionMix = 1.0 - vTunnelPhase;
    finalColor += vec3(0.92, 0.62, 0.22) * uVelocity * 0.32 * interactionMix;
    finalColor += vec3(0.94, 0.76, 0.36) * uPulse * 0.38 * interactionMix;
    finalColor = mix(finalColor, finalColor * vec3(1.15, 1.05, 0.95), uHover * 0.18 * interactionMix);

    float tun = vTunnelPhase;
    finalColor *= mix(vec3(1.0), vec3(1.14, 1.06, 0.92), tun * 0.55);
    finalColor *= 1.0 + tun * 0.62;

    float phaseFade = 1.0;
    if (uScrollProgress >= 0.5 && uScrollProgress < 0.75) {
      float t2 = (uScrollProgress - 0.5) / 0.25;
      phaseFade = 1.0 - t2 * 0.1;
    } else if (uScrollProgress >= 0.75 && uScrollProgress < 0.85) {
      float t2 = (uScrollProgress - 0.75) / 0.10;
      phaseFade = 0.88 + t2 * 0.12;
    } else if (uScrollProgress >= 0.85) {
      float farFade = smoothstep(-20.0, -8.0, vWorldZ);
      float nearFade = 1.0 - smoothstep(2.0, 5.0, vWorldZ);
      float raw = farFade * nearFade;
      phaseFade = sqrt(max(raw, 0.001)) * 0.78 + 0.22;
      phaseFade = clamp(phaseFade, 0.36, 1.0);
    }

    float deep = smoothstep(0.88, 1.0, uScrollProgress);
    finalColor *= 1.0 + deep * 0.28;

    finalColor *= mix(1.0, 3.0, step(0.85, uScrollProgress));

    finalColor *= 0.44;

    gl_FragColor = vec4(finalColor, alpha * phaseFade * vBuildAlpha);
  }
`
