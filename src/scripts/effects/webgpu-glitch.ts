import shader from './glitch.wgsl?raw';
import type { SurfaceSnapshot } from './glitch-scene';
import { SIGNAL_WGSL } from './signal-palette';

export interface GlitchRenderer {
  play(snapshot: SurfaceSnapshot, start: number, duration: number, seed: number): boolean;
  stop(): void;
  destroy(): void;
}

export async function createGlitchRenderer(
  unavailable: () => void,
): Promise<GlitchRenderer | undefined> {
  if (!navigator.gpu || !isSecureContext) return;
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
  if (!adapter) return;
  const device = await adapter.requestDevice();
  let destroyed = false;
  try {
    const module = device.createShaderModule({
      code: SIGNAL_WGSL + shader,
      label: 'Digital packet corruption',
    });
    if ((await module.getCompilationInfo()).messages.some((m) => m.type === 'error')) {
      device.destroy();
      return;
    }
    const format = navigator.gpu.getPreferredCanvasFormat();
    const pipeline = await device.createRenderPipelineAsync({
      layout: 'auto',
      vertex: { module, entryPoint: 'vertexMain' },
      fragment: {
        module,
        entryPoint: 'fragmentMain',
        targets: [
          {
            format,
            blend: {
              color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
    });
    const canvas = document.createElement('canvas');
    canvas.className = 'glitch-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.hidden = true;
    const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!context) {
      device.destroy();
      return;
    }
    const buffer = device.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    const values = new Float32Array(12);
    let texture: GPUTexture | undefined;
    let frame = 0;
    document.body.append(canvas);
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.hidden = true;
      context.unconfigure();
      texture?.destroy();
      texture = undefined;
    };
    const fail = () => {
      stop();
      unavailable();
    };
    device.addEventListener('uncapturederror', fail);
    void device.lost.then(() => {
      if (!destroyed) fail();
    });
    return {
      play(snapshot, start, duration, seed) {
        if (destroyed || performance.now() - start >= duration - 40) return false;
        stop();
        const { rect, element } = snapshot;
        const { left, top, width, height, offsetX, offsetY } = snapshot.bounds;
        const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(262144 / (width * height)));
        const source = snapshot.rasterize();
        texture = device.createTexture({
          size: [source.width, source.height],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture({ source }, { texture }, [
          source.width,
          source.height,
        ]);
        canvas.width = Math.ceil(width * ratio);
        canvas.height = Math.ceil(height * ratio);
        Object.assign(canvas.style, {
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
        values.set([
          width,
          height,
          0,
          0,
          offsetX,
          offsetY,
          rect.width,
          rect.height,
          seed,
          snapshot.intensity,
          0,
          0,
        ]);
        const group = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer } },
            { binding: 1, resource: texture.createView() },
            { binding: 2, resource: sampler },
          ],
        });
        context.configure({ device, format, alphaMode: 'premultiplied' });
        canvas.hidden = false;
        const render = (now: number) => {
          if (destroyed || document.hidden || !element.isConnected || now - start >= duration) {
            stop();
            return;
          }
          try {
            values[2] = Math.max(0, (now - start) / duration);
            device.queue.writeBuffer(buffer, 0, values);
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
            pass.draw(3);
            pass.end();
            device.queue.submit([encoder.finish()]);
            frame = requestAnimationFrame(render);
          } catch {
            fail();
          }
        };
        render(performance.now());
        return !canvas.hidden;
      },
      stop,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        stop();
        device.removeEventListener('uncapturederror', fail);
        buffer.destroy();
        device.destroy();
        canvas.remove();
      },
    };
  } catch {
    device.destroy();
    return;
  }
}
