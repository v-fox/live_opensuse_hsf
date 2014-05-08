#!/bin/bash

sed -i -e "/A=/s:[^\=]:=\"coconuts\":g" test
sed -i -e "/B=/s:[^\=]:=\"fish\":g" test
