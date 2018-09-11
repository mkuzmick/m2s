# m2s

This is a utility that grabs markers from an `.fcpxml` file and generates stills for each, naming each still (and changing its creation date) to match its timecode.

You need to give an `.fcpxml` file, and you need to make sure that that fcpxml file is pointed at the media (currently there's no way to relink from within this script).  If your media gets unlinked, go back into FCPX, relink the media, and generate a new `.fcpxml` file.

Type your command like so:

```
   m2s --fcpxml [path/to/your/fcpxml]
```

Your mileage may vary---this script breaks pretty easily.  Send any advice our way :)
