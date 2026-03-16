---
title: LuaRuntime Plugin (UE 5.7)
slug: luaruntime-release
date: 11 Dec 2025
sortDate: "2025-12-11"
summary: The LuaRuntime plugin for Unreal Engine 5.7 is now public.
---

Just made "my" LuaRuntime plugin for Unreal Engine 5.7 public. It's something I wanted to integrate into a game for a while, but I never had the technical know-how to do it.

The actual primary goal of this plugin was to test the viability of AI agents for plugin development.

As someone who's slightly more focused on the "game" side of programming, I would often find myself with cool ideas for games that I couldn't make because I didn't have the technical skills to implement them. And oftentimes the marketplace plugins either didn't exist, were too expensive, out of date, not supported, or just didn't fit my needs.

But with the rise of "vibe coding" platforms (terrible name) like Codex and Claude Code, I thought they could perhaps take the burden of the technical hurdles and shift my focus more towards the creative stuff I like doing.

One of these ideas was to make a game that involved scripting (Replicube, Bitburner, etc.) I'd always heard how embeddable the Lua runtime is, so it seemed like a good fit.

This plugin is NOT battle-tested or really production-ready, but it does work surprisingly well. The agents essentially one-shotted it. I did go and do some further iteration on the BP integration, but I can't really take credit for much.

If you're interested in adding Lua scripting to your UE5 game, check it out! Technically it's a 5.7 plugin, but it should compile pretty easily for any 5.x version (with some minor tweaks).

Here's the link: https://github.com/frinky04/LuaRuntimePlugin-UnrealEngine
