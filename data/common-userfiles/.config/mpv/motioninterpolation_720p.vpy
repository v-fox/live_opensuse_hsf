# vim: set ft=python:

# see the README at https://gist.github.com/phiresky/4bfcfbbd05b3c2ed8645
# source: https://github.com/mpv-player/mpv/issues/2149
# source: https://github.com/mpv-player/mpv/issues/566
# source: https://github.com/haasn/gentoo-conf/blob/nanodesu/home/nand/.mpv/filters/mvtools.vpy

import vapoursynth
core = vapoursynth.get_core()

dst_fps = display_fps
# Interpolating to fps higher than 60 is too CPU-expensive, smoothmotion can handle the rest.
while (dst_fps > 60):
    dst_fps /= 2

if "video_in" in globals():
    # realtime
    clip = video_in
    # Needed because clip FPS is missing
    src_fps_num = int(container_fps * 1e8)
    src_fps_den = int(1e8)
    clip = core.std.AssumeFPS(clip, fpsnum = src_fps_num, fpsden = src_fps_den)
else:
    # run with vspipe
    clip = core.ffms2.Source(source=in_filename)
    dst_fps=float(dst_fps)

# resolution in megapixels. 1080p ≈ 2MP, 720p ≈ 1MP
mpix = clip.width * clip.height / 1000000

# Skip interpolation for >720p or 60 Hz content due to performance
if not (mpix > 1 or clip.fps_num/clip.fps_den > 59):

    dst_fps_num = int(dst_fps * 1e4)
    dst_fps_den = int(1e4)
    print("Reflowing from ",src_fps_num/src_fps_den," fps to ",dst_fps_num/dst_fps_den," fps.")
    
    sup  = core.mv.Super(clip, pel=2)
    bvec = core.mv.Analyse(sup, isb=True)
    fvec = core.mv.Analyse(sup, isb=False)
# "FlowFPS" is supposed to give better picture than "BlockFPS" for the price of performance
    clip = core.mv.BlockFPS(clip, sup, bvec, fvec, num=dst_fps_num, den=dst_fps_den)

clip.set_output()
