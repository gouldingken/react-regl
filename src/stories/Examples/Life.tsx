import React from 'react'
import regl, { ReglFrame } from '../../'

const RADIUS = 512
const INITIAL_CONDITIONS = (Array(RADIUS * RADIUS * 4)).fill(0).map(
  () => Math.random() > 0.9 ? 255 : 0)

const state = (Array(2)).fill(0).map(() => {
  return regl.framebuffer({
    color: regl.texture({
      radius: RADIUS,
      data: INITIAL_CONDITIONS,
      wrap: 'repeat'
    }),
    depthStencil: false,
  })
})

const updateLife = regl({
  frag: `
   precision mediump float;
   uniform sampler2D prevState;
   varying vec2 uv;
   void main() {
     float n = 0.0;
     for(int dx=-1; dx<=1; ++dx)
     for(int dy=-1; dy<=1; ++dy) {
       n += texture2D(prevState, uv+vec2(dx,dy)/float(${RADIUS})).r;
     }
     float s = texture2D(prevState, uv).r;
     if(n > 3.0+s || n < 3.0) {
       gl_FragColor = vec4(0,0,0,1);
     } else {
       gl_FragColor = vec4(1,1,1,1);
     }
   }`,

  framebuffer: ({tick}) => state[(tick + 1) % 2]()
})

const setupQuad = regl({
  frag: `
   precision mediump float;
   uniform sampler2D prevState;
   varying vec2 uv;
   void main() {
     float state = texture2D(prevState, uv).r;
     gl_FragColor = vec4(vec3(state), 1);
   }`,

  vert: `
   precision mediump float;
   attribute vec2 position;
   varying vec2 uv;
   void main() {
     uv = 0.5 * (position + 1.0);
     gl_Position = vec4(position, 0, 1);
   }`,

  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },

  uniforms: {
    prevState: ({tick}) => state[tick % 2]()
  },

  depth: { enable: false },

  count: 3
})

export const Life = () => {
  let derp: any = regl;
  return (
    <ReglFrame onFrame={(context, regl) => {
      setupQuad(() => {
        derp.draw()
        updateLife()
      })
    }}/>
  );
};
