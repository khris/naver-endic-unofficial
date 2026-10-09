---
title: Version History
permalink: /history/
---

{% for item in site.github.releases %}
{% if item.draft == true or item.prerelease == true %}
    {% continue %}
{% endif %}
{% include release.html item=item %}
{% endfor %}

{% for item in site.data.old_releases %}
<div>
    <h2>v{{ item.version }}</h2>
    {{ item.description | markdownify }}
</div>
{% endfor %}
