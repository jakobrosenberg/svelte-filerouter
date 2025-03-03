<script>
    export let hide

    let level = __routify.log.level
    const logLevels = {
        default: 3,
        error: 1,
        warn: 2,
        debug: 4,
    }

    $: console.log(level)
    $: if (level != __routify.log.level) {
        __routify.log.level = Number(level)
    }
</script>

<span> Routify Helper </span>

<select bind:value={level}>
    {#each Object.entries(logLevels) as [name, value]}
        <option {value} selected={level == value}>
            {name}
        </option>
    {/each}
</select>

<a toggle on:click={hide}><span></span></a>

<style>
[toggle] {
    display: inline-block;
    position: absolute;
    right: 0;
    width: 30px;
    height: 30px;
    cursor: pointer;
}
[toggle] span {
    display: inline-block;
    margin: 8px 6px;
    width: 16px;
    height: 16px;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBmaWxsPSIjNDQ0IiBkPSJNMTUuNTYzIDQwLjgzNmEuOTk3Ljk5NyAwIDAgMCAxLjQxNCAwbDE1LTE1YTEgMSAwIDAgMCAwLTEuNDE0bC0xNS0xNWExIDEgMCAwIDAtMS40MTQgMS40MTRMMjkuODU2IDI1LjEzIDE1LjU2MyAzOS40MmExIDEgMCAwIDAgMCAxLjQxNHoiLz48L3N2Zz4=);
    transform: rotate(90deg);
}
</style>
