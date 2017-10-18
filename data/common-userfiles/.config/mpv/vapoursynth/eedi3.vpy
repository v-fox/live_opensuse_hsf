# vim: set ft=python:

# http://forum.doom9.org/showthread.php?t=172652
import vapoursynth as vs
import math
# this needs to be installed
#import edi_rpow2 as edi
core = vs.get_core()

###### direct inclusion of edi_rpow2
def correct_edi_shift(clip,rfactor,plugin):
	if clip.format.subsampling_w==1:
		hshift=-rfactor/2+0.5 # hshift(steps+1)=2*hshift(steps)-0.5
	else :
		hshift=-0.5
	
	if plugin=="fmtconv":
		bits=clip.format.bits_per_sample
		if clip.format.subsampling_h==0:
			clip=core.fmtc.resample(clip=clip,sx=hshift,sy=-0.5)
		else :
			clip=core.fmtc.resample(clip=clip,sx=hshift,sy=-0.5,planes=[3,2,2])
			clip=core.fmtc.resample(clip=clip,sx=hshift,sy=-1,planes=[2,3,3])
		if bits!=16:
			clip=core.fmtc.bitdepth(clip=clip,bits=bits)
	
	if plugin=="zimg":
		if clip.format.subsampling_h==0:
			clip=core.z.Subresize(clip=clip,resample_filter="spline36",width=clip.width,height=clip.height,shift_w=hshift,shift_h=-0.5)
		else :
			Y=core.std.ShufflePlanes(clips=clip, planes=0, colorfamily=vs.GRAY)
			U=core.std.ShufflePlanes(clips=clip, planes=1, colorfamily=vs.GRAY)
			V=core.std.ShufflePlanes(clips=clip, planes=2, colorfamily=vs.GRAY)
			Y=core.z.Subresize(clip=Y,resample_filter="spline36",width=clip.width,height=clip.height,shift_w=hshift,shift_h=-0.5)
			U=core.z.Subresize(clip=U,resample_filter="spline36",width=clip.width,height=clip.height,shift_w=hshift/2,shift_h=-0.5)
			V=core.z.Subresize(clip=V,resample_filter="spline36",width=clip.width,height=clip.height,shift_w=hshift/2,shift_h=-0.5)
			clip=core.std.ShufflePlanes(clips=[Y,U,V], planes=[0,0,0], colorfamily=vs.YUV)
	
	return clip

def edi_rpow2(clip,rfactor,correct_shift,edi):
	steps=math.log(rfactor)/math.log(2) # 2^steps=rfactor
	
	if (steps).is_integer:
		steps=int(steps)
	else :
		raise ValueError('nnedi3_rpow2 : rfactor must be a power of two')
	
	if correct_shift not in [None,"fmtconv","zimg"]:
		raise ValueError('correct_shift must be None, "fmtconv" or "zimg"')
	
	clip=core.std.Transpose(clip)
	for i in range(0,steps):
		clip=edi(clip,field=1,dh=1)
	clip=core.std.Transpose(clip)
	clip=edi(clip,field=1,dh=1)
	for i in range(0,steps-1):
		clip=edi(clip,field=0,dh=1)
	
	if correct_shift=="fmtconv" or correct_shift=="zimg":
		clip=correct_edi_shift(clip,rfactor=rfactor,plugin=correct_shift)
		
	return clip

def eedi2_rpow2(clip,rfactor,correct_shift="fmtconv",mthresh=None,lthresh=None,vthresh=None,estr=None,dstr=None,maxd=None,map=None,nt=None,pp=None):
	def edi(clip,field,dh):
		return core.eedi2.eedi2(clip=clip,field=field,mthresh=mthresh,lthresh=lthresh,vthresh=vthresh,estr=estr,dstr=dstr,maxd=maxd,map=map,nt=nt,pp=pp)
	return edi_rpow2(clip=clip,rfactor=rfactor,correct_shift=correct_shift,edi=edi)

def eedi3_rpow2(clip,rfactor,correct_shift="fmtconv",alpha=None,beta=None,gamma=None,nrad=None,mdis=None,hp=None,ucubic=None,cost3=None,vcheck=None,vthresh0=None,vthresh1=None,vthresh2=None,sclip=None):
	def edi(clip,field,dh):
		return core.eedi3.eedi3(clip=clip,field=field,dh=dh,alpha=alpha,beta=beta,gamma=gamma,nrad=nrad,mdis=mdis,hp=hp,ucubic=ucubic,cost3=cost3,vcheck=vcheck,vthresh0=vthresh0,vthresh1=vthresh1,vthresh2=vthresh2,sclip=sclip)
	return edi_rpow2(clip=clip,rfactor=rfactor,correct_shift=correct_shift,edi=edi)
###### end of direct inclusion

if "video_in" in globals():
    # realtime
    clip = video_in
else:
    # run with vspipe
    clip = core.ffms2.Source(source=in_filename)

    clip = core.fmtc.bitdepth(clip=clip,bits=16)

# skip doubling >480p content due to performance but 4x on small content
if clip.height > 480:
    print("Not touching resolution with eedi3")
else:
    if clip.height < 250:
        scaling=2
        print("Quadrupling resolution with eedi3")
        clip = eedi3_rpow2(clip=clip,rfactor=scaling)
    else:
        scaling=2
        print("Doubling resolution with eedi3")
        clip = eedi3_rpow2(clip=clip,rfactor=scaling)

    #clip = core.fmtc.resample(clip=clip,scale=2/3)

clip.set_output()
