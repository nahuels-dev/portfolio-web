import shader from './blackwall.wgsl?raw';
import { sizeField, type FieldRenderer } from './blackwall-field';
import { SIGNAL_WGSL } from '../effects/signal-palette';
import accentShader from './signal-accent.wgsl?raw';
import type { SignalAccent } from './signal-accent';

export async function createGPUField(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  lost: () => void,
  accent?: SignalAccent,
): Promise<FieldRenderer | undefined> {
  if (!navigator.gpu || !isSecureContext || signal.aborted) return;
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
  if (!adapter || signal.aborted) return;
  const device = await adapter.requestDevice();
  if (signal.aborted) {
    device.destroy();
    return;
  }
  let dead = false;
  try {
    const module = device.createShaderModule({
      code:
        SIGNAL_WGSL +
        (accent ? accentShader : 'fn accentSignal(uv:vec2f)->f32{return 1.;}\n') +
        shader,
      label: 'Blackwall entry field',
    });
    if ((await module.getCompilationInfo()).messages.some((m) => m.type === 'error')) {
      device.destroy();
      return;
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    const pipeline = await device.createRenderPipelineAsync({
      layout: 'auto',
      vertex: { module, entryPoint: 'vertexMain' },
      fragment: { module, entryPoint: 'fragmentMain', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
    });
    if (signal.aborted) {
      device.destroy();
      return;
    }
    const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!context) {
      device.destroy();
      return;
    }
    const buffer = device.createBuffer({
      size: 32,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const uniforms = new Float32Array(8);
    const group = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer } }],
    });
    const maskTexture = accent
      ? device.createTexture({
          label: 'Blackwall signal glyph',
          size: [accent.mask.width, accent.mask.height],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        })
      : undefined;
    const accentBuffer = accent
      ? device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
      : undefined;
    const accentUniforms = new Float32Array(8);
    const accentGroup =
      maskTexture && accentBuffer
        ? device.createBindGroup({
            layout: pipeline.getBindGroupLayout(1),
            entries: [
              { binding: 0, resource: maskTexture.createView() },
              { binding: 1, resource: { buffer: accentBuffer } },
            ],
          })
        : undefined;
    let maskRevision = -1;
    const resize = () => {
      sizeField(canvas, 524288);
      context.configure({ device, format, alphaMode: 'premultiplied' });
    };
    const fail = () => {
      if (!dead) lost();
    };
    device.addEventListener('uncapturederror', fail);
    void device.lost.then(fail);
    resize();
    return {
      resize,
      render(state) {
        if (dead || signal.aborted) return;
        uniforms.set([
          innerWidth,
          innerHeight,
          state.time,
          state.progress,
          state.x,
          state.y,
          state.breach,
          0,
        ]);
        device.queue.writeBuffer(buffer, 0, uniforms);
        if (accent && maskTexture && accentBuffer) {
          if (maskRevision !== accent.revision) {
            device.queue.copyExternalImageToTexture(
              { source: accent.mask },
              { texture: maskTexture },
              [accent.mask.width, accent.mask.height],
            );
            maskRevision = accent.revision;
          }
          const b = accent.bounds;
          accentUniforms.set([b.x, b.y, b.width, b.height, accent.reveal, accent.strength, 0, 0]);
          device.queue.writeBuffer(accentBuffer, 0, accentUniforms);
        }
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, group);
        if (accentGroup) pass.setBindGroup(1, accentGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
      },
      destroy() {
        if (dead) return;
        dead = true;
        device.removeEventListener('uncapturederror', fail);
        context.unconfigure();
        buffer.destroy();
        maskTexture?.destroy();
        accentBuffer?.destroy();
        device.destroy();
        canvas.width = 1;
        canvas.height = 1;
        canvas.hidden = true;
      },
    };
  } catch {
    device.destroy();
    return;
  }
}
