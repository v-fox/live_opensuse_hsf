#!/bin/bash

while read i; do
	sort -u < "${i}" > "${i}.sorted"
	mv -v "${i}.sorted" "${i}"
done < sort.list
