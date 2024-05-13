import { useState } from "react";
import {
  Button,
  Checkbox,
  Combobox,
  Grid,
  Group,
  Input,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";
import * as React from "react";
import {
  useSubmit,
  Form as RemixForm,
  json,
  useActionData,
} from "@remix-run/react";

export function MultiSelectCheckbox(name, data, placeholder) {
  const [search, setSearch] = useState("");
  const [value, setValue] = useState(undefined);
  const [focused, setFocused] = useState(false);

  const submit = useSubmit();

  React.useEffect(() => {
    if (value != undefined)
      submit(
        { forminput: value, name: name, intent: "filter" },
        { method: "post" }
      );
  }, [value]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const handleValueSelect = (val) => {
    setValue((current) =>
      current != null
        ? current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val]
        : [val]
    );
  };

  const handleValueRemove = (val) =>
    setValue((current) => current?.filter((v) => v !== val));

  const values = value?.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ));

  const options = data
    .filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
    .map((item) => (
      <Combobox.Option value={item} key={item} active={value?.includes(item)}>
        <Grid>
          <Grid.Col span="content">
            <Checkbox
              checked={value?.includes(item)}
              onChange={() => {}}
              aria-hidden
              tabIndex={-1}
              style={{ pointerEvents: "none" }}
            />
          </Grid.Col>
          <Grid.Col span="auto">{item}</Grid.Col>
        </Grid>
      </Combobox.Option>
    ));

  return (
    <RemixForm method="post" onSubmit={(e) => e.preventDefault()}>
      <Combobox
        store={combobox}
        onOptionSubmit={handleValueSelect}
        withinPortal={false}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            pointer
            onFocus={() => {
              setFocused(true);
              combobox.toggleDropdown();
            }}
            onBlur={() => setFocused(false)}
          >
            <Pill.Group>
              {values?.length > 0 ? (
                values
              ) : search.length === 0 && !focused ? (
                <Input.Placeholder>{placeholder}</Input.Placeholder>
              ) : (
                ""
              )}

              <Combobox.EventsTarget>
                <PillsInput.Field
                  onBlur={() => combobox.closeDropdown()}
                  value={search}
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setSearch(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && search.length === 0) {
                      event.preventDefault();
                      if (value.length > 0) {
                        handleValueRemove(value[value.length - 1]);
                      }
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown>
          <Combobox.Options>
            {options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>Nothing found...</Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <input name="forminput" id="forminput" type="hidden" value={value} />
    </RemixForm>
  );
}
