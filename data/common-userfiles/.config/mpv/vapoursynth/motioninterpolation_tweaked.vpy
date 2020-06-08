# vim: set ft=python:

# see the README at https://gist.github.com/phiresky/4bfcfbbd05b3c2ed8645
# source: https://github.com/mpv-player/mpv/issues/2149
# source: https://github.com/mpv-player/mpv/issues/566
# source: https://github.com/haasn/gentoo-conf/blob/nanodesu/home/nand/.mpv/filters/mvtools.vpy

import vapoursynth

core = vapoursynth.get_core()
# ref: http://avisynth.org.ru/mvtools/mvtools2.html#functions
# default is 400, less means interpolation will only happen when it will work well
# bigger means that bigger steps in movement (such as low-fps animation im anime) will be ignored
# but lower means that distortions like grain may be interpreted as movement
# default is 400, 320 means movement of 8*8 block for 5 pixels
ignore_threshold=256
# if n% of blocks change more than threshold then don't interpolate at all (default is 51%)
scene_change_percentage=81

dst_fps = display_fps

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

# Skip interpolation for >1440p or >75 Hz content due to performance
if not (mpix > 3.7 or clip.fps_num/clip.fps_den > 75):
	analParams = {
	    'opt': True,
	    'overlap': 0,
	    'search': 3,
	    'truemotion': True,
	    'opt': True,
	    'blksize': 16,
	    'blksizev': 16,
	    'dct': 9
	}
	blockParams = {
	    'opt': True,
	    'thscd1': ignore_threshold,
	    'thscd2': int(scene_change_percentage*255/100),
	}

	# Interpolating too too high fps is too CPU-expensive, smoothmotion can handle the rest.
	# see the description of these parameters in http://avisynth.org.ru/mvtools/mvtools2.html#functions
	if mpix > 2.1:
		# half-assed effort for 1080-1440p before giving up completely
		analParams['search'] = 4
		analParams['blksize'] = 64
		analParams['blksizev'] = 64
		analParams['dct'] = 9
		blockParams['mode'] = 0
		blockParams['thscd1'] = 256
		quality = 'low'
		INTERPOLATE_FUNCTION='BlockFPS'
		# don't interpolate sub-30 content past 30 and 31-60 - past 60
		if (clip.fps_num/clip.fps_den <= 30 and dst_fps > 30):
			while (dst_fps > 30):
				dst_fps = 30
		elif (clip.fps_num/clip.fps_den <= 60 and dst_fps > 60):
			while (dst_fps > 60):
				dst_fps = 60
	elif mpix > 1.1:
		# intermediate, compromised quality for ~1080p
		analParams['search'] = 4
		analParams['blksize'] = 32
		analParams['blksizev'] = 32
		analParams['dct'] = 9
		blockParams['mode'] = 2
		blockParams['thscd1'] = 128
		quality = 'medium'
		INTERPOLATE_FUNCTION='BlockFPS'
		# don't interpolate sub-50 content past 50 but allow >50 to go up to ~75
		if (clip.fps_num/clip.fps_den <= 50 and dst_fps > 50):
			while (dst_fps > 50):
				dst_fps = 50
	elif mpix < 0.5:
		# highest quality for lowest-res, ≤480p content
		quality = 'extreme'
		analParams['search'] = 3
		analParams['blksize'] = 4
		analParams['blksizev'] = 4
		analParams['dct'] = 2
		blockParams['thscd1'] = 64
		INTERPOLATE_FUNCTION='FlowFPS'        
	else:
		# strong quality for ~720p
		analParams['search'] = 5
		analParams['blksize'] = 8
		analParams['blksizev'] = 8
		analParams['dct'] = 4
		blockParams['mode'] = 7
		blockParams['thscd1'] = 64
		quality = 'high'
		INTERPOLATE_FUNCTION='BlockFPS'

	dst_fps_num = int(dst_fps * 1e4)
	dst_fps_den = int(1e4)
	print("Reflowing from {} fps to {} fps (quality={})".format(clip.fps_num/clip.fps_den,dst_fps_num/dst_fps_den,quality))
    
	sup  = core.mv.Super(clip, pel=2)
	bvec = core.mv.Analyse(sup, isb=True, **analParams)
	fvec = core.mv.Analyse(sup, isb=False, **analParams)
	clip = getattr(vapoursynth.core.mv,INTERPOLATE_FUNCTION)(clip, sup, bvec, fvec, 
	    num=dst_fps_num, den=dst_fps_den, 
	    **blockParams)
	clip.set_output()
else:
	print("Skipping motion interpolation for >1440p or >75 Hz video")
	clip.set_output()
