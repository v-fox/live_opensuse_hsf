# vim: set ft=python:

import vapoursynth as vs
core = vs.get_core()
clip = video_in

dst_fps = display_fps
# Interpolating to fps higher than 60 is too CPU-expensive, smoothmotion can handle the rest.
while (dst_fps > 60):
    dst_fps /= 2

# Skip interpolation for >480p or ≥60Hz content due to performance
if not (clip.width > 720 or clip.height > 480 or container_fps > 58):
    src_fps_num = int(container_fps * 1e8)
    src_fps_den = int(1e8)
    dst_fps_num = int(dst_fps * 1e4)
    dst_fps_den = int(1e4)
    # Needed because clip FPS is missing
    clip = core.std.AssumeFPS(clip, fpsnum = src_fps_num, fpsden = src_fps_den)
    print("Reflowing from ",src_fps_num/src_fps_den," fps to ",dst_fps_num/dst_fps_den," fps.")
    
    sup = core.mv.Super(clip, pel=2)
    bvec = core.mv.Analyse(sup, isb=True , overlap=0)
    fvec = core.mv.Analyse(sup, isb=False, overlap=0)
# "FlowFPS" is supposed to give better picture than "BlockFPS" for the price of performance
    clip = core.mv.FlowFPS(clip, sup, bvec, fvec, num=dst_fps_num, den=dst_fps_den)
    clip.set_output()
else:
    clip.set_output()
