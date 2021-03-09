#!/usr/bin/python
# vim: set ft=python:

# see the README at https://gist.github.com/v-fox/43c287426c366679afc4c65eece60cbc
# source: https://github.com/mpv-player/mpv/issues/2149
# source: https://github.com/mpv-player/mpv/issues/566
# source: https://github.com/haasn/gentoo-conf/blob/nanodesu/home/nand/.mpv/filters/mvtools.vpy

import vapoursynth
import functools
core = vapoursynth.get_core()

# enable any of those ONLY if you believe in the power of your CPU ! biggest overlap will give especially major quality improvement
# even on very strong system using combination of ≥10 target bit-depth, best DCT (1-4) and low block-sizes (16x2, 4x4, 8x8) will mass frame-skip or hang
BYPASS_HDR = True
AVOID_DOWNSAMPLING_FORMAT_BITS = False
AVOID_UPSAMPLING_FORMAT_BITS = True
AVOID_DOWNSAMPLING_FORMAT = False
# main setting: "FLowFPS" versus "BlockFPS"
# Flow-mode gets rid of ugly blocking artefacts of Block-mode and interpolates fluidly but is very costly
INTERPOLATE_FUNCTION = "FlowFPS"
# override setting of quality profiles that may prefer BlockFPS ?
ALWAYS_FLOW = False
# always use 4x4 blocks ?
MIN_BLOCKSIZE = False
MAX_PRECISION = False
# decent DCT is costlier of all, "pure" DCT mode of "1" is almost impossible to work in realtime, so "3" is the best option
BEST_DCT = False
MAX_SEARCH = False
BEST_SEARCH = False
# these seem to be largely useless + both block subdivision with 2-stage analysis and overlap detection seem to be do more harm than good
BEST_SEARCH_POSTDIVIDE = False
MAX_OVERLAP_POSTDIVIDE = False
MAX_OVERLAP = False
DUAL_OVERLAP = True
AUTO_OVERLAP = False
AUTO_OVERLAP_POSTDIVIDE = False
DUAL_DCT = True

# interlacing detection via TDeintMod for tagging interlaced frames for further processing
INTERLACING_DETECTION = True
# detection can't guess type of interlacing, it has to be hardcoded: 0 for Bottom Field First, 1 is Top Field First
INTERLACING_TYPE = 0
# selective deinterlacing using NNEDI3 via vapoursynth-nnedi3 ≥ 12 which is VERY resource-heavy
DEINTERLACE = True
# force up-sampling to 16 bit to avoid theoretical loss of quality ? that makes deinterlacing even more resource-heavy !
DEINTERLACE_UPSAMPLE = True
# deband in VS ? requires vapoursynth-f3kdb
# this is especially useful with videos encoded with pre-h264 codecs that often created ugly block artifacts
# but it also means that it may be wasteful on modern well-coded ≥720 videos UNLESS their bitrate is too low
DEBAND = True
DEBAND_UPSAMPLE = True
# convert video into YUV via VS ? requires vapoursynth-fmtconv
# format conversions can be skipped by setting its variables to "None" without quotes
# 444 for max quality, 422 for good, 420 for worse
# input and output formats should be the same or better than source video to avoid loss in quality
FORMAT_INPUT = 420
# format for non-YUV sources when FORMAT_INPUT=None
FORMAT_INPUT_FALLBACK = 420
FORMAT_INPUT_FLOAT = 1
# set to the same as input to skip conversion right before output
FORMAT_OUTPUT = None
FORMAT_OUTPUT_FLOAT = FORMAT_INPUT_FLOAT
# after format conversion clip is 16 or 32 bits and needs to be down-converted to 8 but you may keep it bigger if you can
# especially if you play 10- or 12-bit videos on HDR displays for which you should use 10 and 16 bits respectively
# 8, 9, 10, 12, 16, 32 integer and float are supported as YUV, RGB is 16-bit integer or 32-bit float
# BUT mvtools' "Super" function does NOT support non-YUV, >16-bits or float ! so, down-sampling and dithering can use float as input but not as output
# dithering modes are 0=ordered, 1=closest round, 2=round, 3=Sierra-2-4A ED (fast), 4=Stucki ED (good edges, bad gradients), 5=Atkinson ED (visible patterns), 6=Floyd-Steinberg ED, 7=Ostromoukhov ED (slow and integer-only), 8=Void and cluster halftone
# dithering pattern can be 4/8/16/32 wide; rotation may not be good for slow displays, like VA
# resampling kernels are point (NN), rect (box), linear (bilinear), cubic (bicubic), lanczos (sinc), blackman, blackmanminlobe, spline/16/36/64, gauss, sinc
FORMAT_INPUT_BITS = 8
FORMAT_INPUT_KERNEL = "lanczos"
FORMAT_INPUT_KERNEL_TAPS = 6
FORMAT_INPUT_DITH_MODE = 8
FORMAT_INPUT_DITH_ROTATE = 0
FORMAT_INPUT_DITH_STATIC_NOISE = 0
FORMAT_INPUT_DITH_AMP_ORDERED = 2
FORMAT_INPUT_DITH_AMP_NOISE = 0
FORMAT_INPUT_DITH_PATTERN = 32
FORMAT_OUTPUT_BITS = None
FORMAT_OUTPUT_KERNEL = "cubic"
FORMAT_OUTPUT_KERNEL_TAPS = 6
FORMAT_OUTPUT_DITH_MODE = FORMAT_INPUT_DITH_MODE
FORMAT_OUTPUT_DITH_ROTATE = FORMAT_INPUT_DITH_ROTATE
FORMAT_OUTPUT_DITH_STATIC_NOISE = FORMAT_INPUT_DITH_STATIC_NOISE
FORMAT_OUTPUT_DITH_AMP_ORDERED = FORMAT_INPUT_DITH_AMP_ORDERED
FORMAT_OUTPUT_DITH_AMP_NOISE = FORMAT_INPUT_DITH_AMP_NOISE
FORMAT_OUTPUT_DITH_PATTERN = FORMAT_INPUT_DITH_PATTERN
# degrain in mvtools ? this should make picture "flat" and help with interpolation by getting rid of some false vectors
# this is extremely heavy operation that requires its own 1 or 2 passes of analyzation on 1-3 adjacent (back & forward) frames after all conversions but before interpolation
# using more than 1 frame may require increasing mpv's "buffered-frames" to the same value
DEGRAIN = False
DEGRAIN_CHROMA = True
DEGRAIN_FRAMES = 1

# http://avisynth.org.ru/mvtools/mvtools2.html#functions
# default is 400, less means interpolation will only happen when it will work well
# bigger means that bigger steps in movement (such as low-fps animation im anime) will be ignored
# but lower means that distortions like grain may be interpreted as movement
# …or is it vice versa ?
# default is 400, max is 16320 (255 pixels of movement), 320 means movement of 8*8 block for 5 pixels and is auto-scaled for other block sizes, 128 is safe value that still produces decent results
# increase it until you see "jumping square" artifacts but it's better to keep it low and decrease lsad & lambda and increase search quality instead
vector_length_in_pixels = 64
ignore_threshold = 64 * vector_length_in_pixels
# this (thscd2) supposed to avoid attempts in finding non-existent vectors between scene changes by setting limiter in-between values 0 (0%) and 255 (100%), default is 130 (51%)
# where ignore_threshold (thscd1) is defined in range 0-16320 (where 16320 is 8x8 block moving for 255 pixels)
# BUT it doesn't seem to be behaving that way. instead, every ignore_threshold values has corresponding hard-cut scene_change value where
# ugly scene-mixing is still cut off and overshooting it will make it useless. thscd1=512/768/1024/1536/2048/3072 & thscd2=125-176/18-64/36-70/8-40/18/3 has shown to work
# there seems to be no defined limits for thscd2 (NOT actually 255) and negative are silently accepted (but block any interpolation ?)…
# this has greatest effect with scenes with flashing lights
scene_change_percent = 99
# what is the limit for interpolating ? it seems that mvtools not just limited by amount of interpolated frames
# but size and amount of output frames in general, so doing more than 1440p@60 is impractical
# ~4.0 mpix is ~1440p and ~8.5 mpix is ~4K
max_mpix = 4.0
max_mpix_hq = 0.922
# the bigger the source's framerate, the more often frame analyzation should happen, so CPU load rises exponentially
# especially if software realtime format conversion is used in the player
min_src_fps = 9
max_src_fps_lq = 31
max_src_fps_hq = 51
# maximum allowed target frame-rate for interpolation
max_dst_fps = 145

# ideally, this should have the same precision as what GPU driver uses for driving the display but ≥8 gives out errors
# here's it's an actual value of monitor's refresh rate
dst_fps = float(display_fps)
dst_fps_num = int(dst_fps * 1e6)
dst_fps_den = int(1e6)

PLAYER_FAIL = False
# Getting frames
if "video_in" in globals():
	# realtime
	clip = video_in
	# mpv may screw up and report 0 or something random as container_fps
	if container_fps == 0:
		print("[mvtools]: player screwed up in determining video's fps, so we skip all processing !")
		PLAYER_FAIL = True
	else:
		# Needed because clip FPS is missing
		print("[mvtools]: Container fps reported by mpv is {}".format(container_fps))
		# how precise this should be ? definitively, not less than e4 but is bigger necessary ?
		src_fps_num = int(container_fps * 1e8)
		src_fps_den = int(1e8)
		clip = core.std.AssumeFPS(clip, fpsnum = src_fps_num, fpsden = src_fps_den)
		print("[mvtools]: Running in realtime with {} / {} initial src / dst fps".format(clip.fps_num / clip.fps_den, dst_fps_num / dst_fps_den))
else:
	# run with vspipe
	clip = core.ffms2.Source(source=in_filename)
	print("[mvtools]: Running with vspipe with {} / {} initial src / dst fps".format(clip.fps_num / clip.fps_den, dst_fps_num / dst_fps_den))
 
if not PLAYER_FAIL:
	# resolution in megapixels. 1080p ≈ 2MP, 720p ≈ 1MP
	mpix = clip.width * clip.height / 1000000
	src_fps = clip.fps_num / clip.fps_den
else:
	mpix = 999
	src_fps = 999

# finding out info about source video
FORMAT=clip.format.name
FORMAT_FAMILY=clip.format.color_family
FORMAT_TYPE="float" if clip.format.sample_type else "integer"
FORMAT_BITS=clip.format.bits_per_sample
FORMAT_SAMPLES_HORIZONTAL=clip.format.subsampling_w
FORMAT_SAMPLES_VERTICAL=clip.format.subsampling_h
FORMAT_PLANES=clip.format.num_planes
FORMAT_WIDTH=clip.width
FORMAT_HEIGHT=clip.height
print("[mvtools]: Video source is {}x{} {}-bit {} {} ({}) with {} {}/{}-subsampled planes".format(FORMAT_WIDTH, FORMAT_HEIGHT,\
	FORMAT_BITS, FORMAT_TYPE, FORMAT, FORMAT_FAMILY, FORMAT_PLANES, FORMAT_SAMPLES_HORIZONTAL, FORMAT_SAMPLES_VERTICAL))

# Skip interpolation for >max_mpix megapixel or =>max_src_fps Hz content due to performance
if mpix > max_mpix_hq:
	max_src_fps = max_src_fps_lq
else:
	max_src_fps = max_src_fps_hq

if not (PLAYER_FAIL or \
	(BYPASS_HDR and ((FORMAT_BITS > 8 and AVOID_DOWNSAMPLING_FORMAT_BITS) or (FORMAT != "YUV420P8" and AVOID_DOWNSAMPLING_FORMAT))) or \
	(mpix > max_mpix) or \
	(src_fps < min_src_fps) or \
	(src_fps > max_src_fps) or \
	(src_fps >= max_dst_fps)):
	
	# number of layers in the clip. default is '0' meaning "auto" which, seams, to default to '6' and putting any more than that does no seem to work
	# technically, "necessary" number of levels should depend on resolution, block-size and target operation but it doesn't seem to actually matter
	# <3 values seem to be missing a lot of good vectors while >3 create a lot of bad vectors, so 
	levels = 0
	# default lsad seem to be 1200 and, as lambda, varies its behavior with number of levels and type of SAD scaling, defined by plevel
	lsad = 4096
	#lsad = int(1200 / (6 / levels))
	#lsad = int(1200 * (2 ** (ignore_threshold / 400)))
	# low badsad seems to negate "rejected predictions", which leads to a lot of weird vectors, that are defined by limits set by pnew and ignore_threshold/thscd1
	badsad = 16320
	# TUNE pnew PARAMETER VERY CAREFULLY !
	# too small will produces ugly "halo" artifacts on edges of moving objects
	# too big will skip interpolation on many movements
	# mvtools' default is 48, bigger overlap may compensate for lower, artifact-inducing values
	# although, lambda may be more important than overlap in combating low vector penalty artifacts
	# 112/64 pnew/pzero seems to be fine for 32x32 blocksizes on ~720p. as with lambda, seems it needs to be much smaller for bigger blocks
	# BUT it's, most likely, the consequence of finding MUCH less vectors, meaning that bigger blocks may hard-cap interpolation
	pnew_scale = False
	pnew_offset = 0
	pnew_offset_for_overlap = 0
	pnew_offset_divisor = 0
	pnew_offset_divisor_for_overlap = 0
	# formula for blocksize 8x8, one after profiles below accounts for other sizes
	pnew_8x8 = int(((2 ** (ignore_threshold / 16320)) - 1) * (256 - pnew_offset_divisor_for_overlap) + pnew_offset_for_overlap) if (MAX_OVERLAP_POSTDIVIDE or MAX_OVERLAP) else\
		int(((2 ** (ignore_threshold / 16320)) - 1) * (256 - pnew_offset_divisor) + pnew_offset)
	# smaller lambda_mult_last & lambda_mult_last_postdivide may introduce block-shaped artifacts
	# bigger one will skip some interpolation but may compensate for artifacts due to small pnew
	# mysteriously, lambda seems to be behaving the opposite it supposed to on high resolutions (≥1080p) and/or block-sizes (≥64):
	# for some reason it's much more aggressive which forces smaller values or even zero to avoid excessive lambda-induced artifacts
	# it supposed to be using (1000 * blksize * blksizev / 64) formula by default but maybe mvtools scales to blksize* internally while expecting 8x8 for all real sizes ?
	# meaning that it's supposed to be just (lambda_mult_first * lambda_mult_last) ? or that >32 block-sizes just broken
	# first multiplier is recommended to be 1000 and the last: in 0.5-2.0 range
	lambda_mult_first = 1024
	#lambda_mult_first = int(1024 / (6 / levels))
	lambda_mult_last = 7.0
	lambda_mult_last_withdivide = 4.0
	lambda_mult_last_postdivide = 7.0
	overlap_offset = 3
	overlap_offset_divisor = 0
	overlap_offset_postdivide = 1
	overlap_offset_divisor_postdivide = 32
	# defining default parameters
	# 'opt' means "use CPU's vector function acceleration such as SSE and AVX"
	# 'divide' means to divide blocks in half with simple (2) or simpler (1) vector calculations for them
	# 'search' is select type of vector-searching function: 4 is fast and fine (h264-derived), 5 is good but slow, 3 is even slower and requiress negative searchparam
	# 'searchparam' and 'pelsearch' are min and max search radius or vector-count, depending on the algorithm, supposedly
	# 'chroma' is for using both contrast and colour for calculations or not
	# 'truemotion' is "better" defaults that we override anyway
	# 'blksize' & 'blksizev' for block sizes. theoretically: the bigger they are, the easier to calculate. practically: bigger blocks lose vectors, skip interpolation and produce unavoidable artifacts on complex surfaces
	# 'dct' said to "improve motion vector estimation at luma flicker and fades" but anything other than 5-10 is slow, 9 & 10 are fastest, 5 may help with artefacts of translucent text, 1-2 are ideal but slowest
	# 'pnew', 'pzero' and 'pglobal' set "replacement threshold" for vectors, similarly to 'ignore_threshold' but in reverse: lower values give smoother motion but with more artifacts
	Analyze_Common_Params = {
		'overlap': 0,
		'overlapv': 0,
		'divide': 0,
		'search': 4,
		'searchparam': 2,
		'truemotion': True,
		'pnew': 48,
		'blksize': 64,
		'blksizev': 32,
		'dct': 8
	}
	# 'plevel' 0/1/2 is none/linear/quadratic scaling for "penalty factor lambda" where 'lambda' supposed to be another threshold against artifacts on non-global vectors
	# 'lsad' is "SAD limit for lambda", whatever that means. "Local lambda is decreased if SAD value of vector predictor (formed from neighbor blocks) is greater than the limit. It prevents bad predictors using but decreases the motion coherence"…
	## default 'lsad' is 1200, smaller values also seem to produce block-artifacts
	# so, if default 320-400 thscd1 gets lsad=1200 and max thscd1 is 16320 where lsad > thscd1 doesn't make sense
	# should we do lsad=3*thscd1 for thscd1=320 and lsad=1*thscd1 for thscd1=16320 with gradual multiplier step-down from 3 to 1 ?
	## 'badsad' is threshold 'to make more wide second search for bad vectors' in 'badrange' that is "radius of wide search for bad blocks"
	# default of 'badsad' is 10000 which disables it
	# it's unclear what benefit it supposed to bring because in recommended values of 1000-2000
	# it only results in blocky artifacts, with their amount depending on 'badrange'
	# less 'levels' means simpler and faster calculations but more (good and bad) missed vectors. what is the default for Analyze and Super ?
	# the fact that super-clip has bigger number of levels does not mean that they are actually used by analyzation and
	# number of levels that analyzation wants depends on resolution of the video and size of blocks & overlap detection
	# https://github.com/dubhater/vapoursynth-mvtools/blob/28f70ba737c6ac4e25d026536b5556e5c94ddde3/src/MVAnalyse.c#L569-L603
	# it seem that vector size (maximum length of interpolation for a moving object) is tied to Analyze_Params['pelsearch'], Interpolate_Params['thscd1'] and Interpolate_Params['ml']
	# maximum values is 255 pixels for virtual 8x8 block derived from pelsearch=256 for search-modes 3/4/5, thscd1=16320=8*8*255 and ml=255
	# more allow interpolating on larger distances on low-framerate videos, like anime, but also may lead to false predictions and artifacts
	Analyze_Params = {
		'search_coarse': 4,
		'trymany': False,
		'lsad': lsad,
		'badsad': badsad,
		'badrange': 32,
		'pzero': 64,
		'pglobal': 0,
		'plevel': 1,
		'pelsearch': 256,
		'levels': levels
	}
	# degrain analyzation at ~480p needs at minimum 4 levels but any >16x16 interpolation sometimes wants at least 6
        # 'pel' means precision: 1 is pixel (may cause artifacts), 2 is half-pixel (default and recommended) and 4 is quarter-pixel (slow)
        # 'sharp' is used for interpolation with pel 2|4: 0 for billinear 2-tap blur, 1 for bicubic 4 taps and 2 for Lanczos-like 6-tap Wiener
	# 'rfilter' = 0 is nearest-neighbour filtering, 1 is simple triangle, 2 is default bilinear triangle, 3 is quadratic, 4 is cubic
	Super_Params = {
		'pel': 4,
		'sharp': 1,
		'rfilter': 4,
		'levels': Analyze_Params['levels']
	}
	# Avisynth docs say: "ml parameter defines the scale of motion mask.
	# When the vector's length (or other kind value) is superior or equal to ml,
	# the output value is saturated to 255. The lesser value results to lesser output.
	# The greater values are corresponded to more weak occlusion mask (as in MMask function, use it to tune and debug). Default=100"…
	# …buuuuut practice of using vapoursynth shows that "255" is far from the maximum (which is unknown) and picture is more detailed with much larger values
	# 2^32=4294967296 seems to give nice results without any performance strain, >255 values may work better with lower vector penalties of (pnew, pzero and pglobal) but higher lsad & lambda
	# "blend: blend frames at scene change like ConvertFps if true, or repeat last frame like ChangeFps if false"… but that seem to work only when badsad & badrange feature is effectively disabled
	## for FLowFPS
	# mask=0 is simple backward and forward occlusion masks (used in versions up to 1.4.x, fastest);
	# mask=1 is similar masks with additional switching to static zero vectors at occlusion areas (similar to v1.5.x);
	# mask=2 is for using extra vectors from adjacent frames for decreasing objects halo at occlusion areas (v1.8, slowest). Default=2.
	# for BlockFPS
	# mode=0 - average of fetched forward and backward partial motion compensation (fastest).
	# mode=1 - static median.
	# mode=2 - dynamic median.
	# mode=3 - time weigthed combination of fetched forward blocks masked by shifted backward and fetched backward masked by shifted forward (now default mode);
	# mode=4 - mode 3 mixed with simple static time average by occlusion mask of shifted blocks.
	# mode=5 - occlusion mask (for debug).
	# mode=6 to 8 - modes like 3 to 5 but SAD mask is used as occlusion mask.
	Interpolate_Params = {
		'thscd1': ignore_threshold,
		'thscd2': int((255 / 100) * scene_change_percent),
		'ml': 65536,
		'blend': False,
		'mask': 2,
		'mode': 3
	}

	# chroma should NOT be used in interlacing detection
	# defaults are cthresh=6, blockx=16, blocky=16, chroma=False, mi=64
	Interlace_Detection_Params = {
		'chroma': False,
		'cthresh': 7,
		'blockx': 128,
		'blocky': 128,
		'mi': (128 * 128 // 8)
		}
	
	DeInterlace_Params = {
		'order': INTERLACING_TYPE,
		'field': INTERLACING_TYPE,
		'mode': 0,
		'length': 12,
		'mtype': 1,
		'ttype': 5,
		'athresh': 3,
		'expand': 1
		}
	
	# use 'combed_only' options to ensure to skip non-interlaced frames
	DeInterlace_Params_nnedi3 = {
		'field': INTERLACING_TYPE,
		'combed_only': True
		}

	# see https://github.com/SAPikachu/flash3kyuu_deband/blob/master/docs/source/usage.rst
	DeBand_Params = {
	    'range': 21,
	    'y': 160,
	    'cb': 160,
	    'cr': 160,
	    'grainy': 16,
	    'grainc': 16,
	    'sample_mode': 2,
	    'blur_first': False,
	    'dynamic_grain': True,
	    'dither_algo': 3,
	    'random_algo_ref': 2,
	    'random_algo_grain': 2,
	    'random_param_ref': 0.25,
	    'random_param_grain': 0.1
	}

	# defaults for optional degrain step
	# player's degrain might be less precise but much more efficient… if it bothers to do it _before_ VS filter
	DeGrain_Params = {
		'thsad': 128,
		'limit': 255,
		'thscd1': Interpolate_Params['thscd1'],
		'thscd2': Interpolate_Params['thscd2']
	}
	DeGrain_Super_Params = {
		'pel': 4,
		'sharp': 1,
		'rfilter': Super_Params['rfilter']
	}
	DeGrain_Analyze_Params = {
		'truemotion': False,
		'trymany': False,
		'pnew': 256,
		'lsad': Analyze_Params['lsad'],
		'pzero': 255,
		'pglobal': 0,
		'plevel': Analyze_Params['plevel'],
		'search': 4,
		'search_coarse': 4,
		'searchparam': 2,
		'pelsearch': 128,
		'blksize': 128,
		'blksizev': 128,
		'overlap': 0,
		'divide': 0,
		'dct': Analyze_Common_Params['dct']
	}

	# Interpolating for too high fps is too CPU-expensive, smoothmotion can handle the rest.
	# see the description of these parameters in http://avisynth.org.ru/mvtools/mvtools2.html#functions
	# this is calibrated for Intel Xeon 2650v2 (Ryzen 1600) and mpv's "vf-pre=format=fmt=<X>" conversion to yuv422p or yuv440p
	# more detailed formats (ideally, yuv444p10) use more CPU but lesser ones (yuv420p) ruin details
	# using worse formats or disabling 'overlap' & 'divide' and 'badrange' will allow usage of smaller 'blocksize'
	# dct modes <5 are extremely slow in all cases
	if mpix > 2.1:
		# half-assed effort for 1080p-max_mpix before giving up completely
		quality = 'low'
		INTERLACING_DETECTION = False
		Interlace_Detection_Params['cthresh'] = 12
		DEINTERLACE = False
		DEBAND = False
		DEGRAIN = False
		DEGRAIN_CHROMA = False
		DEGRAIN_FRAMES = 1
		DeGrain_Params['thsad'] = 96
		DUAL_DCT = True
		DUAL_OVERLAP = False
		#FORMAT_INPUT = 420
		FORMAT_INPUT_KERNEL = "cubic"
		FORMAT_INPUT_KERNEL_TAPS = 4
		FORMAT_INPUT_DITH_MODE = 3
		FORMAT_INPUT_DITH_PATTERN = 32
		Interlace_Detection_Params['blockx'] = 64
		Interlace_Detection_Params['blocky'] = Interlace_Detection_Params['blockx']
		# interlaced crap at that resolution is unlikely, unless it's raw "Ultra HD TV" footage from assholes
		Interlace_Detection_Params['mi'] = Interlace_Detection_Params['blockx'] * Interlace_Detection_Params['blocky'] // 2
		#pnew_offset = 32
		#pnew_offset_divisor = 208
		#overlap_offset_divisor_postdivide = 0
		#lambda_mult_last //= 4
		#lambda_mult_last_withdivide //= 4
		#lambda_mult_last_postdivide //= 4
		#Analyze_Params['lsad'] //= 4
		#INTERPOLATE_FUNCTION = 'BlockFPS'
		#Interpolate_Params['thscd1'] = 8192
		Interpolate_Params['mode'] = 3
		#Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last)
		if mpix < 3.6:
			Analyze_Common_Params['blksize'] = 128
			Analyze_Common_Params['blksizev'] = 64
		else:
			Analyze_Common_Params['blksize'] = 128
			Analyze_Common_Params['blksizev'] = 128
		Analyze_Common_Params['divide'] = 0
		#Analyze_Common_Params['overlap'] = 4
		#Analyze_Common_Params['overlapv'] = 4
		#Analyze_Common_Params['dct'] = 10
		Analyze_Common_Params['search'] = 4
		#Analyze_Common_Params['searchparam'] = 256 // levels
		Analyze_Params['search_coarse'] = 4
		Analyze_Params['pelsearch'] = 256
		#Analyze_Params['trymany'] = False
		#Analyze_Params['plevel'] = 2
		#Analyze_Params['levels'] = 6
		#Super_Params['levels'] = 6
		Super_Params['pel'] = 1
		Super_Params['sharp'] = 0
		# don't interpolate sub-30 content past ~50 and the rest - past ~60
		if (src_fps < 30 and dst_fps > 30):
			dst_fps = 30
		else:
			dst_fps = src_fps
	elif mpix > 1.1:
		# intermediate, compromised quality for ~1080p
		quality = 'medium'
		#MAX_SEARCH = True
		# the only place you would stumble at 1920x1080 interlaced video is shitty 1080i HDTV
		INTERLACING_DETECTION = False
		Interlace_Detection_Params['cthresh'] = 11
		DEINTERLACE = True
		DEBAND = True
		DEBAND_UPSAMPLE = False
		DEGRAIN = True if src_fps < 29 and FORMAT_BITS <= 8 else False
		DEGRAIN_CHROMA = True
		DEGRAIN_FRAMES = 1
		DeGrain_Params['thsad'] = 96
		DUAL_DCT = False
		DUAL_OVERLAP = False
		#FORMAT_INPUT = 420
		FORMAT_INPUT_KERNEL = "cubic"
		FORMAT_INPUT_KERNEL_TAPS = 4
		FORMAT_INPUT_DITH_PATTERN = 16
		Interlace_Detection_Params['blockx'] = 32
		Interlace_Detection_Params['blocky'] = Interlace_Detection_Params['blockx']
		Interlace_Detection_Params['mi'] = Interlace_Detection_Params['blockx'] * Interlace_Detection_Params['blocky'] // 4
		#pnew_offset = 4
		#pnew_offset_divisor = 112
		#overlap_offset = 0
		#overlap_offset_divisor_postdivide = 0
		#lambda_mult_last //= 2
		#lambda_mult_last_withdivide //= 2
		#lambda_mult_last_postdivide //= 2
		#Analyze_Params['lsad'] = 1024
		#INTERPOLATE_FUNCTION = 'BlockFPS'
		#Interpolate_Params['thscd1'] = 12228
		#Interpolate_Params['mode'] = 4
		#Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last)
		Analyze_Common_Params['blksize'] = 64
		Analyze_Common_Params['blksizev'] = 64
		Analyze_Common_Params['divide'] = 0
		#Analyze_Common_Params['overlap'] = 4
		#Analyze_Common_Params['overlapv'] = 4
		#Analyze_Common_Params['dct'] = 5
		Analyze_Common_Params['search'] = 4
		#Analyze_Common_Params['searchparam'] = 256 // levels
		#Analyze_Params['global'] = 96
		Analyze_Params['search_coarse'] = 4
		Analyze_Params['pelsearch'] = 256
		#Analyze_Params['trymany'] = False
		#Analyze_Params['plevel'] = 1
		#Analyze_Params['levels'] = 6
		#Super_Params['levels'] = Analyze_Params['levels']
		Super_Params['pel'] = 1
		Super_Params['sharp'] = 0
		# generally, don't interpolate sub-50 content past 50
		if (src_fps < 26.0 and dst_fps > 59.952 and mpix < 1.5):
			dst_fps = 59.952
		elif (src_fps < 26.0 and dst_fps > 59.952 and mpix < 1.75):
			DEBAND = False
			DEGRAIN = False
			dst_fps = 59.952
		elif (src_fps < 50 and dst_fps > 50):
			DEBAND = False
			DEGRAIN = False
			#Analyze_Common_Params['blksize'] = 128
			#Analyze_Params['levels'] = 3
			#Analyze_Params['lsad'] = int(Analyze_Params['lsad'] / (6 / Analyze_Params['levels']))
			#lambda_mult_first = int(lambda_mult_first / (6 / Analyze_Params['levels']))
			#Super_Params['levels'] = Analyze_Params['levels']
			dst_fps = 50
		elif dst_fps > max_dst_fps:
			dst_fps = max_dst_fps
	# change to 0.4 to exclude "high-res" DVD sources to ~720p category and to 0.44 - to include them here
	elif mpix < 0.44:
		# highest quality for lowest-res, ≤480p content
		quality = 'extreme'
		#MAX_OVERLAP = True
		# set type 5 search by default with option to selectively override later
		#BEST_SEARCH = True
		#MAX_SEARCH = True
		# always search for interlacing in near-DVD sources
		INTERLACING_DETECTION = True
		Interlace_Detection_Params['cthresh'] = 6
		DEINTERLACE = True
		DEINTERLACE_UPSAMPLE = True
		DeInterlace_Params['length'] = 6
		DeInterlace_Params['mtype'] = 2
		DeInterlace_Params['ttype'] = 5
		DeInterlace_Params['expand'] = 0
		DeInterlace_Params['athresh'] = -1
		#DeInterlace_Params_nnedi3['combed_only'] = False
		DEBAND = True
		DEBAND_UPSAMPLE = True
		#DeBand_Params['range'] = 24
		#DeBand_Params['y'] = 320
		#DeBand_Params['cb'] = 320
		#DeBand_Params['cr'] = 320
		# addition of noise is better used with degraining
		#DeBand_Params['grainy'] = 16
		#DeBand_Params['grainc'] = 16
		#DeBand_Params['dynamic_grain'] = True
		DEGRAIN = True
		DEGRAIN_CHROMA = True
		DeGrain_Params['thsad'] = 64
		#DUAL_DCT = True
		#DUAL_OVERLAP = False
		if mpix < 0.24:
			INTERLACING_DETECTION = True
			DEINTERLACE = False
			# DCT 1-4 (>4 can't be used on <8x8) and search=5 SLAM the CPU ! so, only pick one ?
			#BEST_DCT = True
			#BEST_SEARCH = False
			#Analyze_Params['search_coarse'] = 3
			#Analyze_Common_Params['search'] = 3
			Analyze_Params['badrange'] = -24
			AVOID_DOWNSAMPLING_FORMAT = True
			AVOID_DOWNSAMPLING_FORMAT_BITS = True
			FORMAT_INPUT_BITS = 10
			DEGRAIN_FRAMES = 3
			Interlace_Detection_Params['blockx'] = 8
			Interlace_Detection_Params['blocky'] = Interlace_Detection_Params['blockx']
			Interlace_Detection_Params['mi'] = Interlace_Detection_Params['blockx'] * Interlace_Detection_Params['blocky'] // 4
			pnew_offset_divisor = 208
			overlap_offset_divisor_postdivide = 32
			if mpix < 0.05:
				# at this size degrain analyzation function may fail with number-of-levels errors
				#DEGRAIN = False
				# it's either 16*2 with dct=0 or 16x8 with dct=4
				Analyze_Common_Params['blksize'] = 16
				Analyze_Common_Params['blksizev'] = 16
				Analyze_Common_Params['divide'] = 0
				#Analyze_Common_Params['overlap'] = 2
				#Analyze_Common_Params['overlapv'] = 2
				Analyze_Common_Params['dct'] = 3
				DeGrain_Analyze_Params['dct'] = 3
			elif mpix < 0.12:
				Analyze_Common_Params['blksize'] = 32
				Analyze_Common_Params['blksizev'] = 16
				Analyze_Common_Params['divide'] = 0
				#Analyze_Common_Params['overlap'] = 2
				#Analyze_Common_Params['overlapv'] = 2
				Analyze_Common_Params['dct'] = 3
				DeGrain_Analyze_Params['dct'] = 3
			else:
				Analyze_Common_Params['blksize'] = 32
				Analyze_Common_Params['blksizev'] = 32
				Analyze_Common_Params['divide'] = 0
				#Analyze_Common_Params['overlap'] = 8
				#Analyze_Common_Params['overlapv'] = 0
				Analyze_Common_Params['dct'] = 3
				DeGrain_Analyze_Params['dct'] = 8
			#Analyze_Common_Params['pnew'] *= 4
			#Analyze_Params['pzero'] = Analyze_Common_Params['pnew']
			#Analyze_Common_Params['searchparam'] = 1
			Analyze_Params['pelsearch'] = 4
			#Super_Params['pel'] = 4
			#Super_Params['sharp'] = 2
		else:
			if mpix > 0.40:
				# some video at this resolution make deinterlacer shit the bed and kill whole pipeline
				INTERLACING_DETECTION = True
				DEINTERLACE = False
			#BEST_SEARCH = False
			#Analyze_Params['search_coarse'] = 5
			#Analyze_Common_Params['search'] = 5
			# degraining might break with some block-size on very low-res videos
			#DEGRAIN = False
			# >1 frames require bigger 'buffered-frames' in mpv which increases seek latency
			DEGRAIN_FRAMES = 2
			DeGrain_Super_Params['pel'] = 2
			Interlace_Detection_Params['blockx'] = 8
			Interlace_Detection_Params['blocky'] = Interlace_Detection_Params['blockx']
			Interlace_Detection_Params['mi'] = Interlace_Detection_Params['blockx'] * Interlace_Detection_Params['blocky'] // 5
			pnew_offset_divisor = 208
			overlap_offset_divisor_postdivide = 32
			#Interpolate_Params['thscd1'] = 16320
			# that pretty much the only size where 16x2 is viable
			# but it's incompatible with division, overlap detection and DCT>4
			Analyze_Common_Params['blksize'] = 32
			Analyze_Common_Params['blksizev'] = 32
			#Analyze_Common_Params['divide'] = 0
			#Analyze_Common_Params['overlap'] = 4
			#Analyze_Common_Params['overlapv'] = 4
			# even at that resolution, you can't get away with DCT<5 with <8x8 block-sizes
			Analyze_Common_Params['dct'] = 8
			DeGrain_Analyze_Params['dct'] = 8
			#Analyze_Common_Params['pnew'] *= 5
			#Analyze_Params['pzero'] = Analyze_Common_Params['pnew']
			#Analyze_Common_Params['searchparam'] = 4
			Analyze_Params['pelsearch'] = 6
			#Analyze_Params['levels'] = -6
			#Super_Params['levels'] = 2
			#Super_Params['pel'] = 2
			#Super_Params['sharp'] = 1
		FORMAT_INPUT_KERNEL = "spline64"
		FORMAT_INPUT_KERNEL_TAPS = 8
		#FORMAT_INPUT_FLOAT = 0
		#FORMAT_INPUT_DITH_MODE = 7
		#FORMAT_INPUT_DITH_ROTATE = 1
		FORMAT_INPUT_DITH_STATIC_NOISE = 0
		FORMAT_INPUT_DITH_PATTERN = 4
		# addition of noise is better used with degraining
		#FORMAT_INPUT_DITH_AMP_NOISE = 1
		#overlap_offset_divisor_postdivide = 32
		#lambda_mult_last = 0.1
		#lambda_mult_last_withdivide = 0.1
		#lambda_mult_last_postdivide = 0.2
		INTERPOLATE_FUNCTION = 'FlowFPS'
		#Interpolate_Params['mask'] = 2
		#lambda_mult_last = 0.5
		#Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last_withdivide)
		#Analyze_Common_Params['blksize'] = 8
		#Analyze_Common_Params['blksizev'] = 8
		#Analyze_Common_Params['divide'] = 0
		#Analyze_Common_Params['overlap'] = 2
		#Analyze_Common_Params['overlapv'] = 2
		#Analyze_Common_Params['dct'] = 8
		Analyze_Common_Params['search'] = 3
		#Analyze_Common_Params['searchparam'] = 4
		# penalty might not be needed with search=3
		#Analyze_Common_Params['pnew'] = 12
		#Analyze_Params['pzero'] = 6
		Analyze_Params['search_coarse'] = 3
		#Analyze_Params['pelsearch'] = ignore_threshold // 64
		#Analyze_Params['trymany'] = True
		#Analyze_Params['plevel'] = 2
		#Analyze_Params['levels'] = 2
		#Super_Params['levels'] = 2
		Super_Params['pel'] = 4
		Super_Params['sharp'] = 2
		# don't interpolate sub-50 content past 120 but allow >50 to go up to max_dst_fps
		if (src_fps <= 50 and dst_fps > 145):
			dst_fps = 145
		elif dst_fps > max_dst_fps:
			dst_fps = max_dst_fps
	else:
		# strong quality for ~720p
		quality = 'high'
		#MAX_SEARCH = True
		if mpix > 0.6:
			# don't waste CPU on searching for interlacing on near-HD sources
			INTERLACING_DETECTION = False
			Interlace_Detection_Params['cthresh'] = 10
			# but still deinterlace if sources are somehow already marked to be such
			DEINTERLACE = True
			DeInterlace_Params['length'] = 10
		else:
			INTERLACING_DETECTION = True
			Interlace_Detection_Params['cthresh'] = 8
			DEINTERLACE = True
			DEINTERLACE_UPSAMPLE = True
			DeInterlace_Params['length'] = 8
		DEBAND = True
		DEBAND_UPSAMPLE = True
		#DeBand_Params['grainy'] = 24
		#DeBand_Params['grainc'] = 24
		DEGRAIN = True
		DEGRAIN_CHROMA = True
		DEGRAIN_FRAMES = 2
		DeGrain_Params['thsad'] = 96
		#DUAL_DCT = True
		#FORMAT_INPUT_DITH_STATIC_NOISE = 0
		FORMAT_INPUT_DITH_PATTERN = 8
		#INTERLACING_TYPE = 0
		Interlace_Detection_Params['blockx'] = 16
		Interlace_Detection_Params['blocky'] = Interlace_Detection_Params['blockx']
		# DVD remux crap now falls under this category, so interlacing is very likely
		Interlace_Detection_Params['mi'] = Interlace_Detection_Params['blockx'] * Interlace_Detection_Params['blocky'] // 6
		#Interlace_Detection_Params['cthresh'] = 6
		#DeInterlace_Params['length'] = 6
		#DeInterlace_Params['mtype'] = 2
		#DeInterlace_Params['ttype'] = 5
		#DeInterlace_Params['expand'] = 3
		#DeInterlace_Params['athresh'] = -1
		#DeInterlace_Params_nnedi3['combed_only'] = False
		#pnew_offset = 8
		#pnew_offset_divisor = 96
		#overlap_offset_divisor = 0
		#overlap_offset_divisor_postdivide = 16
		#lambda_mult_last = 1.2
		#lambda_mult_last_withdivide = 1.2
		#lambda_mult_last_postdivide = 1.6
		INTERPOLATE_FUNCTION = 'FlowFPS'
		#Interpolate_Params['thscd1'] = 12228
		#Interpolate_Params['mode'] = 7
		#lambda_mult_last = 1.25
		#Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last_withdivide)
		if mpix < 0.54:
			Analyze_Common_Params['blksize'] = 32
			Analyze_Common_Params['blksizev'] = 32
			#Analyze_Common_Params['divide'] = 0
			#Analyze_Common_Params['overlap'] = 4
			#Analyze_Common_Params['overlapv'] = 4
			#Super_Params['pel'] = 4
			Super_Params['sharp'] = 1
		else:
			Analyze_Common_Params['blksize'] = 64
			Analyze_Common_Params['blksizev'] = 32
			#Analyze_Common_Params['divide'] = 0
			#Analyze_Common_Params['overlap'] = 2
			#Analyze_Common_Params['overlapv'] = 2
			#Super_Params['pel'] = 2
			Super_Params['sharp'] = 0
		#Analyze_Common_Params['dct'] = 5
		Analyze_Common_Params['search'] = 5
		#Analyze_Common_Params['searchparam'] = 256 // levels
		#Analyze_Common_Params['pnew'] = 32
		#Analyze_Params['pzero'] = Analyze_Common_Params['pnew']
		Analyze_Params['search_coarse'] = 5
		Analyze_Params['pelsearch'] = 6
		#Analyze_Params['trymany'] = False
		#Analyze_Params['plevel'] = 1
		#Analyze_Params['levels'] = -4
		#Super_Params['levels'] = 8
		Super_Params['pel'] = 2
		#Super_Params['sharp'] = 2
		# don't interpolate sub-60 content past ~60 but allow >60 to go up to max_dst_fps
		if (src_fps < 25.0 and dst_fps > 90):
			dst_fps = 90
		elif (25.0 < src_fps < 59.952 and dst_fps > 59.952):
			dst_fps = 59.952
		elif dst_fps > max_dst_fps:
			dst_fps = max_dst_fps
	
	# setup for common super-clip parameters
	if MAX_PRECISION:
		Super_Params['pel'] = 4
		Super_Params['sharp'] = 2
		Super_Params['rfilter'] = 4
	
	# with different blocksizes behaviour changes erratically, so it's impossible to scale automatically here
	# real minimal blocksize is 4x4 and 16x2 but they are pretty impossible for realtime
	# so use mvtools' default of 8x8 which is also crazy CPU strain
	if MIN_BLOCKSIZE:
		Analyze_Common_Params['blksize'] = 4
		Analyze_Common_Params['blksizev'] = 4
	
	# setup for common analyzation parameters
	if ("levels" not in Analyze_Params):
		Analyze_Params['levels'] = 0
	if BEST_SEARCH:
		search_previous = Analyze_Common_Params['search']
		Analyze_Common_Params['search'] = 5
		Analyze_Params['search_coarse'] = 5
		#if Analyze_Common_Params['blksize'] > 16:
		#	Analyze_Common_Params['searchparam'] = 4
		#	Analyze_Params['pelsearch'] = 16
		#elif Analyze_Common_Params['blksize'] > 4:
		#	Analyze_Common_Params['searchparam'] = 3
		#	Analyze_Params['pelsearch'] = 12
		#else:
		#	Analyze_Common_Params['searchparam'] = 2
		#	Analyze_Params['pelsearch'] = 6
	if MAX_SEARCH:
		Analyze_Params['trymany'] = True
	if BEST_DCT:
		Analyze_Common_Params['dct'] = 3
	if AUTO_OVERLAP:
		# when 'divide' is active, overlapX must be in range from 4 to blksizeX/2 and be divisible by 4
		# with lower block sizes minimal overlap seems to be fine but bigger they are, bigger it needs to be, so let's scale it
		if Analyze_Common_Params['divide'] > 0:
			Analyze_Common_Params['overlap'] = int(((((((256 - Analyze_Common_Params['blksize']) / 2) / (256 - (overlap_offset_divisor * 2))) * (Analyze_Common_Params['blksize'] / 2)) + 4) - 1) / 4) * 4
			Analyze_Common_Params['overlapv'] = int(((((((256 - Analyze_Common_Params['blksizev']) / 2) / (256 - (overlap_offset_divisor * 2))) * (Analyze_Common_Params['blksizev'] / 2)) + 4) - 1) / 4) * 4
		else:
			Analyze_Common_Params['overlap'] = int((((((256 - Analyze_Common_Params['blksize']) / 2) / (128 - overlap_offset_divisor)) * (Analyze_Common_Params['blksize'] / 2)) + overlap_offset) / 4) * 2
			Analyze_Common_Params['overlapv'] = int((((((256 - Analyze_Common_Params['blksize']) / 2) / (128 - overlap_offset_divisor)) * (Analyze_Common_Params['blksizev'] / 2)) + overlap_offset) / 4) * 2
	if MAX_OVERLAP:
		Analyze_Common_Params['overlap'] = int(Analyze_Common_Params['blksize'] / 2)
		Analyze_Common_Params['overlapv'] = int(Analyze_Common_Params['blksizev'] / 2)
		# don't try to enforce exact number of level on non-default overlap because it will likely fail
		# use 0 or negative values to ignore "coarse" levels
		# this may be better off being set explicitly in profiles
		#Analyze_Params['levels'] = -2
	if (MAX_OVERLAP_POSTDIVIDE and (not DUAL_OVERLAP)):
		Analyze_Common_Params['overlap'] = 0
		Analyze_Common_Params['overlapv'] = 0
	
	# scale "optimal" pnew for blocksize weirdness ?
	#if ((Analyze_Common_Params['blksize'] + Analyze_Common_Params['blksizev']) / 2) > 8:
	#	Analyze_Common_Params['pnew'] = int(Analyze_Common_Params['pnew'] // (((Analyze_Common_Params['blksize'] + Analyze_Common_Params['blksizev']) / 2) / 8) * 1.8)
	#	Analyze_Params['pzero'] = int(Analyze_Common_Params['pnew'] * 0.875)
	if pnew_scale == True:
		pnew = int(((2 ** (Interpolate_Params['thscd1'] / 16320)) - 1) * (256 - (pnew_offset_divisor_for_overlap + ((Analyze_Common_Params['blksize']+Analyze_Common_Params['blksizev'])/2) - 8)) + pnew_offset_for_overlap) if (MAX_OVERLAP_POSTDIVIDE or MAX_OVERLAP) else\
		int(((2 ** (Interpolate_Params['thscd1'] / 16320)) - 1) * (256 - (pnew_offset_divisor + ((Analyze_Common_Params['blksize']+Analyze_Common_Params['blksizev'])/2) - 8)) + pnew_offset)
		Analyze_Common_Params['pnew'] = pnew
		Analyze_Params['pzero'] = int(pnew * 0.75)
	
	# clip vector penalty values to allowed range
	if Analyze_Common_Params['pnew'] < 0:
		Analyze_Common_Params['pnew'] = 0
	elif Analyze_Common_Params['pnew'] > 256:
		Analyze_Common_Params['pnew'] = 256
	if Analyze_Params['pzero'] < 0:
		Analyze_Params['pzero'] = 0
	elif Analyze_Params['pzero'] > 256:
		Analyze_Params['pzero'] = 256
	
	# override thscd1, lsad and badsad on per-profile basis ?
	#if Analyze_Params['pelsearch'] < Analyze_Common_Params['blksize']:
	#	Analyze_Params['pelsearch'] = Analyze_Common_Params['blksize'] * 2
	# there is no point in searching farther than 256 pixels
	#if Analyze_Params['pelsearch'] >= 256:
	#	Analyze_Params['pelsearch'] = 256
	# requires radius-based search
	#if Analyze_Common_Params['search'] != (0 or 1):
		#Interpolate_Params['ml'] = int(100 + (155 * (Analyze_Params['pelsearch'] / 256)))
		# there is no point in allowing interpolation for changes that are never detected during low-radius analyzation
		#Interpolate_Params['thscd1'] = (8 * 8) * Interpolate_Params['ml']
	# supposedly, it, in addition to vector-penalty, also can clean out bad vectors but sacrifices lambda which may lead to low-lambda artifacts
	#if Analyze_Common_Params['pnew'] > 0:
	#	Analyze_Params['lsad'] = int((8 * 8) * Interpolate_Params['ml'] * (Analyze_Common_Params['pnew'] / 256))
	#else:
	#	Analyze_Params['lsad'] = 12
	## guessing game…
	#Interpolate_Params['thscd1'] = int(16320 * ((Analyze_Params['pelsearch'] - 1) / 255))
	#Interpolate_Params['thscd1'] = int(16320 * (Interpolate_Params['ml'] / 255))
	#Analyze_Params['lsad'] = (8 * 8) * Analyze_Params['pelsearch']
	#Analyze_Params['lsad'] = int(16320 * ((Analyze_Params['pelsearch'] - 1) / 255))
	#Analyze_Params['lsad'] = int(16320 * (Interpolate_Params['ml'] / 255))
	#Analyze_Params['lsad'] = int(Interpolate_Params['thscd1'] * 2/3)
	#Analyze_Params['lsad'] = int((1152 * ((Analyze_Common_Params['blksize'] + Analyze_Common_Params['blksize']) // 2)) / (Interpolate_Params['thscd1'] / 384))
	#Analyze_Params['lsad'] = int((1200 / (8 * 8)) * (Analyze_Common_Params['blksize'] * Analyze_Common_Params['blksizev']))
	# account for aggressive increase of lambda with levels… but doesn't it equals to plevel=0 then ?
	#if Analyze_Params['plevel'] == 1:
	#	lambda_mult_first /= Super_Params['levels']
	#elif Analyze_Params['plevel'] == 2:
	#	lambda_mult_first /= Super_Params['levels']**2
	
	if "badrange" not in Analyze_Params:
		Analyze_Params['badrange'] = Analyze_Common_Params['blksize'] * 3
	if Analyze_Common_Params['divide'] > 0:
		#if Analyze_Params['lsad'] > Interpolate_Params['thscd1']:
		#	Analyze_Params['badsad'] = Analyze_Params['lsad'] + 1
		#else:
		#	Analyze_Params['badsad'] = Interpolate_Params['thscd1'] + 1
		if Analyze_Params['pelsearch'] < 256:
			Analyze_Params['badrange'] = Analyze_Params['pelsearch']
		lambda_mult_last = lambda_mult_last_withdivide
	if "lambda" not in Analyze_Common_Params:
		# scale for blocksize as per avisynth documentation ?
		Analyze_Common_Params['lambda'] = int(lambda_mult_first * (Analyze_Common_Params['blksize'] * Analyze_Common_Params['blksizev'] / 64) * lambda_mult_last)
		# or assume that mvtools scale to blocksize internally from virtual 8x8 values ?
		#Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last)
		# or lower it for bigger blocksizes ?
		#if ((Analyze_Common_Params['blksize'] + Analyze_Common_Params['blksizev']) / 2) > 8:
		#	Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last / (((Analyze_Common_Params['blksize'] + Analyze_Common_Params['blksizev']) / 2) / 8) * 1.6)
		#	Analyze_Params['lsad'] = int(Analyze_Common_Params['lambda'] * 1.2)
	
	# increase lambda for sub-8 block sizes to avoid artifacts ?
	if ((Analyze_Common_Params['blksize'] or Analyze_Common_Params['blksizev']) < 8):
		lambda_mult_first *= 64 // (Analyze_Common_Params['blksize'] * Analyze_Common_Params['blksizev'])
	
	# ideally, this should have the same precision as what GPU driver uses for driving the display but ≥8 gives out errors
	# here's it's the target interpolation frame-rate
	dst_fps_num = int(dst_fps * 1e6)
	dst_fps_den = int(1e6)
	print("[mvtools]: Reflowing from {} fps to {} fps with {} quality".format(clip.fps_num / clip.fps_den, dst_fps_num / dst_fps_den,quality))

	# converting to 444 is ideal but also too much for realtime, 422 is OK, 420 is minimum
	if (FORMAT_INPUT != None and FORMAT_INPUT_BITS != None):
		FORMAT_INPUT_CONSTANT = getattr(vapoursynth,"YUV"+str(FORMAT_INPUT)+"P"+str(FORMAT_INPUT_BITS))
	else:
		FORMAT_INPUT_CONSTANT = 0
	
	if ((FORMAT_INPUT != None) and (FORMAT_FAMILY > FORMAT_INPUT_CONSTANT) and (not AVOID_DOWNSAMPLING_FORMAT)) or\
	(FORMAT_FAMILY != vapoursynth.YUV):
		# force conversion if format is not supported by mvtools even when it configured to be skipped
		if FORMAT_INPUT == None:
			FORMAT_INPUT = FORMAT_INPUT_FALLBACK
		if FORMAT_FAMILY != vapoursynth.YUV:
			print("[mvtools-conversion-input]: forcing conversion of non-YUV format to YUV{}".format(FORMAT_INPUT))
		input_resample_type = "32-bit float" if FORMAT_INPUT_FLOAT == 1 else "16-bit integer"
		print("[mvtools-conversion-input]: converting clip into {} yuv{} with {} kernel and {} taps".format(\
			input_resample_type, FORMAT_INPUT, FORMAT_INPUT_KERNEL, FORMAT_INPUT_KERNEL_TAPS))
		clip = core.fmtc.resample(clip=clip, css = FORMAT_INPUT, kernel = FORMAT_INPUT_KERNEL, taps = FORMAT_INPUT_KERNEL_TAPS)
	elif FORMAT_INPUT == None:
		print("[mvtools-conversion-input]: skipping format conversion because target format was not selected")
	elif FORMAT_FAMILY <= FORMAT_INPUT_CONSTANT:
		print("[mvtools-conversion-input]: skipping format up-conversion because current format {} ({}) is ≤ to target YUV{}P{} ({})".format(\
			FORMAT, FORMAT_FAMILY, FORMAT_INPUT, FORMAT_INPUT_BITS, FORMAT_INPUT_CONSTANT))
	elif AVOID_DOWNSAMPLING_FORMAT:
		print("[mvtools-conversion-input]: skipping format down-conversion of {} ({}) to YUV{}P{} ({})".format(\
			FORMAT, FORMAT_FAMILY, FORMAT_INPUT, FORMAT_INPUT_BITS, FORMAT_INPUT_CONSTANT))
	
	# set interlacing property ?
	if INTERLACING_DETECTION:
		print("[mvtools-deinterlacing]: analyzing and tagging frames for interlacing")
		clip = core.tdm.IsCombed(clip, **Interlace_Detection_Params)
		def set_frame_interlacing(n, f):
			fout = f.copy()
			# set "_Combed" property for every frame that may or may not (most likely) proper "_FieldBased" property
			if (("_FieldBased" not in fout.props) and ("_Combed" in fout.props)):
				# 0 is non-interlaced, 1 is interlaced, bottom field first, 2 is interlaced, top field first
				# how to detect THAT shit ?!
				fout.props['_FieldBased'] = INTERLACING_TYPE + 1
				# but here 0 is BFF and 1 is TFF
				fout.props['_Field'] = INTERLACING_TYPE
			# make sure that both properties are present !
			if (("_FieldBased" in fout.props) and ("_Combed" not in fout.props)):
				fout.props['_Combed'] = 1
			return fout
		
		core.std.ModifyFrame(clip=clip, clips=clip, selector=set_frame_interlacing)
	
	if DEINTERLACE:
		if (DEINTERLACE_UPSAMPLE and (clip.format.bits_per_sample != 16)):
			print("[mvtools-deinterlacing]: up-sampling to 16-bit to avoid bad deinterlacing")
			clip = core.fmtc.bitdepth(clip=clip, bits = 16, \
					dmode = FORMAT_INPUT_DITH_MODE, dyn = FORMAT_INPUT_DITH_ROTATE, staticnoise = FORMAT_INPUT_DITH_STATIC_NOISE,\
					ampo = FORMAT_INPUT_DITH_AMP_ORDERED, ampn = FORMAT_INPUT_DITH_AMP_NOISE, patsize = FORMAT_INPUT_DITH_PATTERN)
		
		print("[mvtools-deinterlacing]: doing NNEDI3 deinterlacing pass for frames with '_FieldBased' and '_Combed' properties")
		def conditionalDeint(n, f, orig, deint):
			if f.props['_FieldBased']:
				return deint
			else:
				return orig
		
		# this may require set '_Combed' property even when auto-detection failed but '_FieldBased' was present
		deint = core.tdm.TDeintMod(clip, **DeInterlace_Params,\
			edeint=core.nnedi3.nnedi3(clip, **DeInterlace_Params_nnedi3))
		
		clip = core.std.FrameEval(clip, functools.partial(conditionalDeint, orig=clip, deint=deint), clip)
		# delete interlacing properties now ?
		core.std.SetFrameProp(clip, prop="_FieldBased", delete=True)
		core.std.SetFrameProp(clip, prop="_Field", delete=True)
		core.std.SetFrameProp(clip, prop="_Combed", delete=True)
	
	# deband before the rest ?
	if DEBAND:
		if (DEBAND_UPSAMPLE and (clip.format.bits_per_sample != 16)):
			print("[mvtools-debanding]: up-sampling to 16-bit to avoid weak dithering of deband plugin")
			clip = core.fmtc.bitdepth(clip=clip, bits = 16, \
				dmode = FORMAT_INPUT_DITH_MODE, dyn = FORMAT_INPUT_DITH_ROTATE, staticnoise = FORMAT_INPUT_DITH_STATIC_NOISE,\
				ampo = FORMAT_INPUT_DITH_AMP_ORDERED, ampn = FORMAT_INPUT_DITH_AMP_NOISE, patsize = FORMAT_INPUT_DITH_PATTERN)
		print("[mvtools-debanding]: smoothing-out YUV planes with {}/{}/{} ({}/{} grain) threshold in range {} with 16-bit output".format(\
			DeBand_Params['y'], DeBand_Params['cb'], DeBand_Params['cr'], DeBand_Params['grainy'], DeBand_Params['grainc'], DeBand_Params['range']))
		clip = core.f3kdb.Deband(clip, output_depth=16, **DeBand_Params)
	else:
		print("[mvtools-debanding]: skipping smoothing and hoping that player had sense to deband before VS filter")
	
	# resample functions also converts the clip into 16 bits which is too much for realtime processing
	FORMAT_BITS_CURRENT = clip.format.bits_per_sample
	if ((FORMAT_INPUT_BITS == None) and (FORMAT_BITS_CURRENT > FORMAT_BITS)) or (AVOID_UPSAMPLING_FORMAT_BITS and (FORMAT_INPUT_BITS > FORMAT_BITS)):
		FORMAT_INPUT_BITS = FORMAT_BITS
	if FORMAT_INPUT_BITS != None:
		if (AVOID_DOWNSAMPLING_FORMAT_BITS and (FORMAT_INPUT_BITS < FORMAT_BITS)):
			FORMAT_INPUT_BITS = FORMAT_BITS
	
	if (FORMAT_INPUT_BITS != None) and ((FORMAT_INPUT_BITS < FORMAT_BITS_CURRENT) or (FORMAT_BITS_CURRENT > FORMAT_INPUT_BITS)):
		print("[mvtools-conversion-input]: dithering {}-bit clip into {}-bit".format(FORMAT_BITS_CURRENT, FORMAT_INPUT_BITS))
		clip = core.fmtc.bitdepth(clip=clip, bits = FORMAT_INPUT_BITS, \
			dmode = FORMAT_INPUT_DITH_MODE, dyn = FORMAT_INPUT_DITH_ROTATE, staticnoise = FORMAT_INPUT_DITH_STATIC_NOISE,\
			ampo = FORMAT_INPUT_DITH_AMP_ORDERED, ampn = FORMAT_INPUT_DITH_AMP_NOISE, patsize = FORMAT_INPUT_DITH_PATTERN)
	elif FORMAT_INPUT_BITS == None:
		print("[mvtools-conversion-input]: skipping dithered bitdepth conversion because target depth was not selected")
	elif FORMAT_INPUT_BITS > FORMAT_BITS_CURRENT:
		print("[mvtools-conversion-input]: skipping dithered bitdepth up-conversion because current depth {} ≤ to target {} depth".format(FORMAT_BITS_CURRENT, FORMAT_INPUT_BITS))
	elif FORMAT_INPUT_BITS == (FORMAT_BITS or FORMAT_BITS_CURRENT):
		print("[mvtools-conversion-input]: skipping dithered bitdepth conversion because current and target depths both are {}".format(FORMAT_BITS_CURRENT))

	### actual interpolation preparations start here
	## degrain before interpolation ?
	if DEGRAIN:
		# degrain to avoid creating false vectors for noise ? plane=0 for luma only, otherwise - 4.
		# Use 1, 2 or 3 frames ? Each analyzation is very CPU-intensive !
		if DEGRAIN_CHROMA:
			DEGRAIN_PLANE = 4
			degrain_chroma_status = "with"
		else:
			DEGRAIN_PLANE = 0
			degrain_chroma_status = "without"
		print("[mvtools-degrain]: degraining {} chroma using {} previous & following frames".format(degrain_chroma_status, DEGRAIN_FRAMES))
		# don't upscale layers for degraining stronger than for interpolation
		if DeGrain_Super_Params['pel'] > Super_Params['pel']:
			DeGrain_Super_Params['pel'] = Super_Params['pel']
		#DeGrain_Super_Params['levels'] = Super_Params['levels']
		sup = core.mv.Super(clip, **DeGrain_Super_Params)
		# analyzation of vectors in the previous frames
		#DeGrain_Analyze_Params['levels'] = Analyze_Params['levels']
		#DeGrain_Analyze_Params['blksize'] = Analyze_Common_Params['blksize']
		#DeGrain_Analyze_Params['blksizev'] = Analyze_Common_Params['blksizev']
		# be more conservative on degrain step to avoid doubling artifacts during actual interpolation ?
		#if 'lsad' in Analyze_Params:
		#	DeGrain_Analyze_Params['lsad'] = int(Analyze_Params['lsad'] * 1.8)
		#if 'lambda' in Analyze_Common_Params:
		#	DeGrain_Analyze_Params['lambda'] = int(Analyze_Common_Params['lambda'] * 1.8)
		# is overlap detection even necessary for degraining ?
		#DeGrain_Analyze_Params['overlap'] = Analyze_Common_Params['overlap']
		#DeGrain_Analyze_Params['overlapv'] = Analyze_Common_Params['overlapv']
		#DeGrain_Analyze_Params['dct'] = Analyze_Common_Params['dct']
		#DeGrain_Analyze_Params['searchparam'] = Analyze_Common_Params['searchparam']
		#DeGrain_Analyze_Params['pnew'] = Analyze_Common_Params['pnew']
		#DeGrain_Analyze_Params['pzero'] = Analyze_Params['pzero']
		#DeGrain_Analyze_Params['pelsearch'] = Analyze_Params['pelsearch']
		#DeGrain_Analyze_Params['plevel'] = Analyze_Params['plevel']
		#DeGrain_Analyze_Params['trymany'] = Analyze_Params['trymany']
		if 'badsad' in Analyze_Params:
			DeGrain_Analyze_Params['badsad'] = Analyze_Params['badsad']
		# just to make sure
		DeGrain_Params['thsadc'] = DeGrain_Params['thsad']
		bvec1 = core.mv.Analyse(sup, delta = 1, isb=True, chroma=DEGRAIN_CHROMA, **DeGrain_Analyze_Params)
		if DEGRAIN_FRAMES > 1:
			bvec2 = core.mv.Analyse(sup, delta = 2, isb=True, chroma=DEGRAIN_CHROMA, **DeGrain_Analyze_Params)
		if DEGRAIN_FRAMES > 2:
			bvec3 = core.mv.Analyse(sup, delta = 3, isb=True, chroma=DEGRAIN_CHROMA, **DeGrain_Analyze_Params)
		# analyzation of vectors in the upcoming frames
		fvec1 = core.mv.Analyse(sup, delta = 1, isb=False, chroma=DEGRAIN_CHROMA, **DeGrain_Analyze_Params)
		if DEGRAIN_FRAMES > 1:
			fvec2 = core.mv.Analyse(sup, delta = 2, isb=False, chroma=DEGRAIN_CHROMA, **DeGrain_Analyze_Params)
		if DEGRAIN_FRAMES > 2:
			fvec3 = core.mv.Analyse(sup, delta = 3, isb=False, chroma=DEGRAIN_CHROMA, **DeGrain_Analyze_Params)
		# actual degraining filter
		if DEGRAIN_FRAMES == 1:
			clip = core.mv.Degrain1(clip, sup, bvec1, fvec1, plane=DEGRAIN_PLANE, **DeGrain_Params)
		elif DEGRAIN_FRAMES == 2:
			clip = core.mv.Degrain2(clip, sup, bvec1, fvec1, bvec2, fvec2, plane=DEGRAIN_PLANE, **DeGrain_Params)
		elif DEGRAIN_FRAMES == 3:
			clip = core.mv.Degrain3(clip, sup, bvec1, fvec1, bvec2, fvec2, bvec3, fvec3, plane=DEGRAIN_PLANE, **DeGrain_Params)
		else:
			print("[mvtools-degrain]: skipping degrain due to wrong frame number: {} !".format(DEGRAIN_FRAMES))
	else:
		print("[mvtools-degrain]: skipping degrain because it was not requested")
	
	## [re]do super-clip for interpolation after degrain step or lack there of
	if Super_Params['pel'] > 1:
		if Super_Params['sharp'] == 0:
			super_sharp = " bilinear "
		elif Super_Params['sharp'] == 1:
			super_sharp = " bicubic 4-tap Catmull-Rom "
		elif Super_Params['sharp'] == 2:
			super_sharp =  " 6-tap Wiener "
		if Super_Params['pel'] == 2:
			super_pel = "half-pixel precision with" + str(super_sharp) + "subpixel interpolation"
		elif Super_Params['pel'] == 4:
			super_pel = "quarter-pixel precision with" + str(super_sharp) + "subpixel interpolation"
		else:
			super_pel = "unknown precision"
	else:
		super_pel = "pixel precision"
	
	if Super_Params['rfilter'] == 0:
		super_rfilter = "simple 4-pixel averaging"
	elif Super_Params['rfilter'] == 1:
		super_rfilter = "triangle (shifted) smoothing"
	elif Super_Params['rfilter'] == 2:
		super_rfilter = "triangle bilinear smoothing"
	elif Super_Params['rfilter'] == 3:
		super_rfilter = "quadratic smoothing"
	elif Super_Params['rfilter'] == 4:
		super_rfilter = "cubic smoothing"
	else:
		super_rfilter = "unknown smoothing"
	
	if ("levels" not in Super_Params):
		Super_Params['levels'] = 0
	if (Super_Params['levels'] != 0):
		super_levels = Super_Params['levels']
	else:
		super_levels = "default number of"
	
	print("[mvtools-super]: {} levels with {}, {}".format(super_levels, super_rfilter, super_pel))
	sup = core.mv.Super(clip, **Super_Params)

	## 2-stage analyzation for interpolation
	block_type = "subdivided-in-4" if Analyze_Common_Params['divide'] > 0 else "undivided"
	search_type = "+" if Analyze_Params['trymany'] else "-"
	if Analyze_Params['plevel'] == 0:
		plevel_type = "no pen-scaling"
	elif Analyze_Params['plevel'] == 1:
		plevel_type = "linear pen-scaling"
	elif Analyze_Params['plevel'] == 2:
		plevel_type = "quad pen-scaling"
	if (Analyze_Params['levels'] != 0):
		analyze_levels = Analyze_Params['levels']
	else:
		analyze_levels = "auto"
	print("[mvtools-analysis]: {}/{} {} blocks, {}/{}/{} new/0/global vec-penalties, {}-level {}/{}:{}/{} search{}, {}/{} overlap, {}/{} badSAD/range, {} λSAD | {} λ with {}, DCT mode:{}".format(\
		 Analyze_Common_Params['blksize'], Analyze_Common_Params['blksizev'], block_type,\
		 Analyze_Common_Params['pnew'], Analyze_Params['pzero'], Analyze_Params['pglobal'], analyze_levels,\
		 Analyze_Params['search_coarse'], Analyze_Common_Params['search'], Analyze_Common_Params['searchparam'], Analyze_Params['pelsearch'], search_type,\
		 Analyze_Common_Params['overlap'], Analyze_Common_Params['overlapv'], Analyze_Params['badsad'], Analyze_Params['badrange'],\
		 Analyze_Params['lsad'], Analyze_Common_Params['lambda'], plevel_type, Analyze_Common_Params['dct']))
	
	bvec1 = core.mv.Analyse(sup, isb=True, **Analyze_Common_Params, **Analyze_Params)
	fvec1 = core.mv.Analyse(sup, isb=False, **Analyze_Common_Params, **Analyze_Params)
	
	## reanalyzation to filter out bad vectors, introduced by high thscd1 with low lambda & lsad & badsad, and accommodate block division
	# make sure to skip it when unneeded
	if Analyze_Common_Params['divide'] > 0:
		# doing divide twice makes no sense
		# disabling it also lifts the requirement of being divisible by 4 or 2 for values of overlapX but overlap is still picky and will refuse many odd values
		Analyze_Common_Params['divide'] = 0
		Analyze_Common_Params['blksize'] = int(Analyze_Common_Params['blksize'] / 2)
		Analyze_Common_Params['blksizev'] = int(Analyze_Common_Params['blksizev'] / 2)
		
		# lambda does not seem to matter much on reanalysis but what is the proper way to calculate it anyway ?
		if (Analyze_Common_Params['lambda'] == int(lambda_mult_first * lambda_mult_last_withdivide)):
			Analyze_Common_Params['lambda'] = int(lambda_mult_first * lambda_mult_last_postdivide)
		elif (Analyze_Common_Params['lambda'] != 0):
			Analyze_Common_Params['lambda'] = int(lambda_mult_first * (Analyze_Common_Params['blksize'] * Analyze_Common_Params['blksizev'] / 64) * lambda_mult_last_postdivide)
		
		if ((DUAL_OVERLAP and ((Analyze_Common_Params['overlap'] or Analyze_Common_Params['overlapv']) > 0)) or\
		((Analyze_Common_Params['overlap'] and Analyze_Common_Params['overlapv']) == 0)):
			if MAX_OVERLAP_POSTDIVIDE:
				Analyze_Common_Params['overlap'] = int(Analyze_Common_Params['blksize'] / 2)
				Analyze_Common_Params['overlapv'] = int(Analyze_Common_Params['blksizev'] / 2)
			elif AUTO_OVERLAP_POSTDIVIDE:
				Analyze_Common_Params['overlap'] = int((((((256 - Analyze_Common_Params['blksize']) / 2) / (128 - overlap_offset_divisor_postdivide)) * Analyze_Common_Params['blksize']/2) + overlap_offset_postdivide) / 4) * 2
				Analyze_Common_Params['overlapv'] = int((((((256 - Analyze_Common_Params['blksize']) / 2) / (128 - overlap_offset_divisor_postdivide)) * Analyze_Common_Params['blksizev']/2) + overlap_offset_postdivide) / 4) * 2
			else:
				Analyze_Common_Params['overlap'] = int(Analyze_Common_Params['overlap'] / 2)
				Analyze_Common_Params['overlapv'] = int(Analyze_Common_Params['overlapv'] / 2)
		else:
			Analyze_Common_Params['overlap'] = 0
			Analyze_Common_Params['overlapv'] = 0
		
		# but always do heaviest version twice in max quality mode
		if (DUAL_DCT and BEST_DCT):
			Analyze_Common_Params['dct'] = 3
		elif not DUAL_DCT:
			Analyze_Common_Params['dct'] = 0
		
		if (BEST_SEARCH and (not BEST_SEARCH_POSTDIVIDE)):
			Analyze_Common_Params['search'] = search_previous
		
		# scale "optimal" pnew for blocksize weirdness ?
		if pnew_scale == True:
			pnew = int(((2 ** (Interpolate_Params['thscd1'] / 16320)) - 1) * (256 - (pnew_offset_divisor_for_overlap + ((Analyze_Common_Params['blksize']+Analyze_Common_Params['blksizev'])/2) - 8)) + pnew_offset_for_overlap) if (MAX_OVERLAP_POSTDIVIDE or MAX_OVERLAP) else\
			int(((2 ** (Interpolate_Params['thscd1'] / 16320)) - 1) * (256 - (pnew_offset_divisor + ((Analyze_Common_Params['blksize']+Analyze_Common_Params['blksizev'])/2) - 8)) + pnew_offset)
			if pnew < 0: pnew = 0
			elif pnew > 256: pnew = 256
			Analyze_Common_Params['pnew'] = pnew
		
		block_type = "subdivided-in-4" if Analyze_Common_Params['divide'] > 0 else "undivided"
		search_type = "+" if Analyze_Params['trymany'] else "-"
		print("[mvtools-reanalysis]: {}/{} {} blocks, {} new vector penalty, {}:{} re-search, {}/{} overlap, {} λ, DCT mode:{}".format(\
			Analyze_Common_Params['blksize'], Analyze_Common_Params['blksizev'], block_type, Analyze_Common_Params['pnew'],\
			Analyze_Common_Params['search'], Analyze_Common_Params['searchparam'],\
			Analyze_Common_Params['overlap'], Analyze_Common_Params['overlapv'],\
			Analyze_Common_Params['lambda'], Analyze_Common_Params['dct']))
		bvec1 = core.mv.Recalculate(sup, bvec1, **Analyze_Common_Params)
		fvec1 = core.mv.Recalculate(sup, fvec1, **Analyze_Common_Params)
	
	## actual interpolation
	# force max-quality interpolation ?
	if ALWAYS_FLOW:
		INTERPOLATE_FUNCTION = "FlowFPS"
		Interpolate_Params['mask'] = 2
	# python is getting pissy if parameter, that is not used by the function, is defined
	if INTERPOLATE_FUNCTION == "FlowFPS":
		del Interpolate_Params['mode']
	elif INTERPOLATE_FUNCTION == "BlockFPS":
		del Interpolate_Params['mask']
	
	interpolation_option = "mode:" + str(Interpolate_Params['mode']) if INTERPOLATE_FUNCTION == "BlockFPS" else "mask:" + str(Interpolate_Params['mask'])
	print("[mvtools-interpolation]: {} function with {} option and {} ignoreSAD".format(INTERPOLATE_FUNCTION, interpolation_option, Interpolate_Params['thscd1']))
	
	clip = getattr(vapoursynth.core.mv,INTERPOLATE_FUNCTION)(clip, sup, bvec1, fvec1, num=dst_fps_num, den=dst_fps_den, **Interpolate_Params)
	
	## convert format before output ?
	if (FORMAT_OUTPUT != None and FORMAT_OUTPUT_BITS != None):
		FORMAT_OUTPUT_CONSTANT = getattr(vapoursynth,"YUV"+str(FORMAT_OUTPUT)+"P"+str(FORMAT_OUTPUT_BITS))
	else:
		FORMAT_OUTPUT_CONSTANT = 0
	FORMAT_FAMILY_CURRENT=clip.format.color_family
	
	if ((FORMAT_OUTPUT != None and (FORMAT_FAMILY_CURRENT > FORMAT_OUTPUT_CONSTANT) and (not AVOID_DOWNSAMPLING_FORMAT)) and (FORMAT_OUTPUT != FORMAT_INPUT)):
		output_resample_type = "32-bit float" if FORMAT_OUTPUT_FLOAT == 1 else "16-bit integer"
		print("[mvtools-conversion-output]: converting clip into {} yuv{} with {} kernel and {} taps".format(output_resample_type, FORMAT_OUTPUT, FORMAT_OUTPUT_KERNEL, FORMAT_OUTPUT_KERNEL_TAPS))
		clip = core.fmtc.resample(clip=clip, flt = FORMAT_OUTPUT_FLOAT, css = FORMAT_OUTPUT, kernel = FORMAT_OUTPUT_KERNEL, taps = FORMAT_OUTPUT_KERNEL_TAPS)
	elif FORMAT_OUTPUT == None:
		print("[mvtools-conversion-output]: skipping format conversion because target format was not selected")
	elif FORMAT_OUTPUT == (FORMAT_INPUT or FORMAT_FAMILY_CURRENT):
		print("[mvtools-conversion-output]: skipping format conversion because current and target format are the same YUV{}".format(FORMAT_OUTPUT))
	elif FORMAT_FAMILY_CURRENT <= FORMAT_OUTPUT_CONSTANT:
		print("[mvtools-conversion-output]: skipping format up-conversion because current format {} ({}) is ≤ to target YUV{}P{} ({})".format(\
			FORMAT, FORMAT_FAMILY, FORMAT_INPUT, FORMAT_INPUT_BITS, FORMAT_INPUT_CONSTANT))
	elif (AVOID_DOWNSAMPLING_FORMAT and (FORMAT_FAMILY_CURRENT > FORMAT_OUTPUT_CONSTANT)):
		print("[mvtools-conversion-output]: skipping format down-conversion of {} ({}) to YUV{}P{} ({})".format(\
			FORMAT, FORMAT_FAMILY, FORMAT_INPUT, FORMAT_INPUT_BITS, FORMAT_INPUT_CONSTANT))
	
	# reduce anomaly upsampled format to something expected
	FORMAT_BITS_CURRENT = clip.format.bits_per_sample
	if ((FORMAT_OUTPUT_BITS == None) and (FORMAT_BITS_CURRENT > (FORMAT_BITS and FORMAT_INPUT_BITS))):
		if FORMAT_BITS_CURRENT > FORMAT_INPUT_BITS:
			FORMAT_OUTPUT_BITS = FORMAT_INPUT_BITS
		else:
			FORMAT_OUTPUT_BITS = FORMAT_BITS
	if FORMAT_OUTPUT_BITS != None:
		if (AVOID_DOWNSAMPLING_FORMAT_BITS and (FORMAT_OUTPUT_BITS < FORMAT_BITS)):
			FORMAT_OUTPUT_BITS = FORMAT_BITS
	
	if (FORMAT_OUTPUT_BITS != None) and ((FORMAT_OUTPUT_BITS < FORMAT_BITS_CURRENT) or (FORMAT_BITS_CURRENT > FORMAT_OUTPUT_BITS)):
		print("[mvtools-conversion-output]: dithering clip into {}-bit".format(FORMAT_INPUT_BITS))
		clip = core.fmtc.bitdepth(clip=clip, bits = FORMAT_OUTPUT_BITS,\
			dmode = FORMAT_OUTPUT_DITH_MODE, dyn = FORMAT_OUTPUT_DITH_ROTATE, staticnoise = FORMAT_OUTPUT_DITH_STATIC_NOISE,\
			ampo = FORMAT_OUTPUT_DITH_AMP_ORDERED, ampn = FORMAT_OUTPUT_DITH_AMP_NOISE, patsize = FORMAT_OUTPUT_DITH_PATTERN)
	elif FORMAT_OUTPUT_BITS == None:
		print("[mvtools-conversion-output]: skipping dithered bitdepth conversion because target depth was not selected")
	elif FORMAT_OUTPUT_BITS > FORMAT_BITS_CURRENT:
		print("[mvtools-conversion-output]: skipping dithered bitdepth up-conversion because current depth {} ≤ to target {} depth".format(FORMAT_BITS_CURRENT, FORMAT_OUTPUT_BITS))
	elif FORMAT_OUTPUT_BITS == (FORMAT_BITS or FORMAT_BITS_CURRENT):
		print("[mvtools-conversion-output]: skipping dithered bitdepth conversion because current and target depths both are {}".format(FORMAT_BITS_CURRENT))
	
	## pumping out finished frames
	clip.set_output()
else:
	if PLAYER_FAIL:
		print("[mvtools-bail]: Skipping motion interpolation due to player's stupidity in determining video's framerate !!!")
	elif (BYPASS_HDR and ((FORMAT_BITS > 8) or (FORMAT != "YUV420P8"))):
		print("[mvtools-bail]: Skipping motion interpolation due to high CPU demands for processing HDR content !!!")
	elif mpix > max_mpix:
		print("[mvtools-bail]: Skipping motion interpolation for {} megapixel video that surpasses limit of {} !!!".format(mpix,max_mpix))
	elif src_fps < min_src_fps:
		print("[mvtools-bail]: Skipping motion interpolation for {} Hz video that's slower than minimum limit of {} !!!".format(src_fps,min_src_fps))
	elif src_fps > max_src_fps:
		print("[mvtools-bail]: Skipping motion interpolation for {} Hz video that surpasses maximum limit of {} !!!".format(src_fps,max_src_fps))
	elif src_fps >= max_dst_fps:
		print("[mvtools-bail]: Skipping meaningless {}->{} interpolation !!!".format(src_fps,max_dst_fps))
	else:
		print("[mvtools-bail]: Skipping motion interpolation for some reason…")
	
	clip = video_in
	clip.set_output()
