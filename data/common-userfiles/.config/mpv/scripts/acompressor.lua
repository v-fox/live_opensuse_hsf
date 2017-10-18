-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
-- 
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
-- GNU General Public License for more details.
-- 
-- You should have received a copy of the GNU General Public License
-- along with this program. If not, see <http://www.gnu.org/licenses/>.
--
--
--
--
-- This script adds control to the dynamic range compression ffmpeg
-- filter including key bindings for adjusting parameters.
--
-- See https://ffmpeg.org/ffmpeg-filters.html#acompressor for explanation
-- of the parameteres.
--
-- Default key bindings:
--              n: Toggle dynamic range compression on or off
--    F1/Shift+F1: Increase/Decrease threshold parameter
--    F2/Shift+F2: Increase/Decrease ratio parameter
--    F3/Shift+F3: Increase/Decrease knee parameter
--    F4/Shift+F4: Increase/Decrease makeup gain parameter
--  Ctrl+1/Ctrl+2: Increase/Decrease attack parameter
--  Ctrl+3/Ctrl+4: Increase/Decrease release parameter
--
-- To change key bindings in input.conf use:
--     BINDING script-message-to acompressor toggle-acompressor
--     BINDING script-message-to acompressor update-param PARAM INCREMENT
-- BINDING is the key binding to use, PARAM is either 'attack', 'release',
-- 'threshold', 'ratio', 'knee' or 'makeup' and INCREMENT is a signed floating
-- point value to add to the current parameter value.
--
-- You may also just adjust default parameters to your liking in this table.
local params = {
	-- 'hide' defines wether the parameter should be ommited from being displayed at the defined value.
	-- It will also be omitted from the ffmpeg filter graph.
	-- 'input_format' is used to parse the value back from a obtained filter graph. This allows us to
	-- reuse the values obtained from a watch later config instead of reverting to default parameter values
	-- 'output_format' defines how the value shall be formatted for creating the filter graph.
	{ name = 'Attack',    value= 20, min=0.01, max=2000, hide= 20, input_format='attack=(%d+[.%d+]*)',       output_format='%g'   },
	{ name = 'Release',   value=250, min=0.01, max=9000, hide=250, input_format='release=(%d+[.%d+]*)',      output_format='%g'   },
	{ name = 'Threshold', value=-25, min= -30, max=   0, hide=nil, input_format='threshold=(-%d+[.%d+]*)dB', output_format='%gdB' },
	{ name = 'Ratio',     value=  3, min=   1, max=  20, hide=nil, input_format='ratio=(%d+[.%d+]*)',        output_format='%g'   },
	{ name = 'Knee',      value=  2, min=   1, max=  10, hide=  2, input_format='knee=(%d+[.%d+]*)dB',       output_format='%gdB' },
	{ name = 'Makeup',    value=  8, min=   0, max=  24, hide=nil, input_format='makeup=(%d+[.%d+]*)dB',     output_format='%gdB' }
}

-- Defines the mpv filter label to be used. This allows us to easily add/replace/remove it, so
-- it should be left so something meaningful and unique.
local filter_label = 'acompressor'

local function update_filter()
	local graph = {}
	local pretty = {}

	for _,param in pairs(params) do
		if param.hide ~= param.value then
			pretty[#pretty+1] = string.format('%s: ' .. param.output_format, param.name, param.value)
			graph[#graph+1] = string.format('%s=' .. param.output_format, string.lower(param.name), param.value)
		end
	end

	if #graph == 0 then
		graph = 'acompressor'
	else 
		graph = 'acompressor=' .. table.concat(graph, ':')
	end

	if #pretty == 0 then
		pretty = ''
	else
		pretty = '\n(' .. table.concat(pretty, ', ') .. ')'
	end

	mp.command(string.format('no-osd af add @%s:lavfi=[%s]; show-text "Dynamic range compressor: enabled%s" 4000; print-text "${af}"', filter_label, graph, pretty))
end

local function toggle_acompressor()
	local graph = nil
	local af = mp.get_property_native('af', {})

	for i = 1, #af do
		if af[i]['name'] == 'lavfi' and af[i]['label'] == 'acompressor' then
			graph = af[i]['params']['graph']
			break
		end
	end

	if graph == nil then
		-- No acompressor filter (from us) found. Turn it on.
		update_filter()
	else
		-- Parameter values from a watch later config can differ from our defaults. Therefore read them in now
		-- before we remove the filter. This way we can reuse them if the acompressor is turned on again later.
		for _,param in pairs(params) do
			local value = tonumber(string.match(graph, param.input_format))
			if value ~= nil and value >= param.min and value <= param.max then
				param.value = value
			end
		end

		mp.command(string.format('no-osd af del @%s; show-text "Dynamic range compressor: disabled"; print-text "${af}"', filter_label))
	end
end

local function update_param(name, increment)
	for _,param in pairs(params) do
		if string.lower(param.name) == string.lower(name) then
			param.value = math.max(param.min, math.min(param.value + increment, param.max))
			update_filter()
			return
		end
	end

	mp.msg.error('Unknown parameter "' .. name .. '"')
end

mp.add_key_binding("n", "toggle-acompressor", toggle_acompressor)
mp.register_script_message('update-param', update_param)

mp.add_key_binding("F1", 'acompressor-inc-threshold', function() update_param('threshold', -5); end, { repeatable = true })
mp.add_key_binding("Shift+F1", 'acompressor-dec-threshold', function() update_param('Threshold', 5); end, { repeatable = true })

mp.add_key_binding("F2", 'acompressor-inc-ratio', function() update_param('Ratio', 1); end, { repeatable = true })
mp.add_key_binding("Shift+F2", 'acompressor-dec-ratio', function() update_param('Ratio', -1); end, { repeatable = true })

mp.add_key_binding("F3", 'acompressor-inc-knee', function() update_param('Knee', 1); end, { repeatable = true })
mp.add_key_binding("Shift+F3", 'acompressor-dec-knee', function() update_param('Knee', -1); end, { repeatable = true })

mp.add_key_binding("F4", 'acompressor-inc-makeup', function() update_param('Makeup', 1); end, { repeatable = true })
mp.add_key_binding("Shift+F4", 'acompressor-dec-makeup', function() update_param('Makeup', -1); end, { repeatable = true })

mp.add_key_binding("Ctrl+1", 'acompressor-inc-attack', function() update_param('Attack', 10); end, { repeatable = true })
mp.add_key_binding("Ctrl+2", 'acompressor-dec-attack', function() update_param('Attack', -10); end, { repeatable = true })

mp.add_key_binding("Ctrl+3", 'acompressor-inc-release', function() update_param('Release', 10); end, { repeatable = true })
mp.add_key_binding("Ctrl+4", 'acompressor-dec-release', function() update_param('Release', -10); end, { repeatable = true })
