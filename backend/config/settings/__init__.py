"""
Settings package for Vero.

Import a concrete environment module rather than this package:

    DJANGO_SETTINGS_MODULE=config.settings.development
    DJANGO_SETTINGS_MODULE=config.settings.production

base.py holds everything shared. The environment modules import * from it and
override only what genuinely differs. This file stays empty on purpose — making
it re-export one of the environments would hide which settings are actually in
force.
"""
