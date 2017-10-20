<doc>
A form field to be mixed in for FormlyFields.
</doc>

<script>
import { allProps } from "utils/vue";

import Field from "./Field";

export default {
    components: { Field },
    extends: Field,
    computed: { allProps },
};
</script>
