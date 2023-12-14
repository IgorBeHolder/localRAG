import React, {useEffect, useRef, useCallback, useState} from "react";
import {ReactTerminal} from "react-terminal";
import {getTimeAgo} from "../../../../../utils/functions.js";

const TerminalComponent = () => {
  const [message, setMessage] = useState(null);
  const [from, setFrom] = useState(null);
  const [email, setEmail] = useState(null);
  const [sent, setSent] = useState(false);
  const [theme, setTheme] = useState("portfolio");

  const themes = {
    matrix: {
      themeBGColor: "#0d0208",
      themeToolbarColor: "#0d0208",
      themeColor: "#00ff41",
      themePromptColor: "#008f11",
      errorColor: "#008f11",
      successColor: "#008f11",
      linkColor: "#00ff41"
    },
    ocean: {
      themeBGColor: "#224fbc",
      themeToolbarColor: "#216dff",
      themeColor: "#e5e5e5",
      themePromptColor: "#00e5e5",
      errorColor: "#e5e500",
      linkColor: "#e5e5e5"
    },
    portfolio: {
      themeBGColor: "#fdf6e4",
      themeToolbarColor: "#d8d8d8",
      themeColor: "#333",
      themePromptColor: "#4495d4",
      errorColor: "#ff443e",
      successColor: "#5b9e47",
      linkColor: "#4495d4"
    }
  };

  const error = {
    color: themes[theme].errorColor,
    fontWeight: "bold"
  };
  const success = {
    color: themes[theme].successColor,
    fontWeight: "bold"
  };
  const link = {
    color: themes[theme].linkColor,
    textDecoration: "underline",
    cursor: "pointer"
  };

  const indent1 = {marginLeft: 15};
  const indent2 = {marginLeft: 30};

  const minMessageLength = 10;
  const maxMessageLength = 1500;
  const minFromLength = 2;
  const maxFromLength = 25;

  const isMobile = window.matchMedia("(max-width: 550px)").matches;

  const welcomeMessage = (
    <span>
      Type <strong>help</strong> for command list
      <br/>
      <br/>
    </span>
  );

  const thankYouMessage = (
    <span style={success}>
      <span>▒▓▓▓▓▓▒▒▓▓▓▓▓▓▓▒▓▒▒▒▒▒▓▒▓▓▓▓▓▓▓▒▓▓▓▒</span>
      <br/>
      <span>▓▒▒▒▒▒▓▒▓▒▒▒▒▒▒▒▓▓▒▒▒▒▓▒▒▒▒▓▒▒▒▒▓▓▓▒</span>
      <br/>
      <span>▓▒▒▒▒▒▒▒▓▒▒▒▒▒▒▒▓▒▓▒▒▒▓▒▒▒▒▓▒▒▒▒▓▓▓▒</span>
      <br/>
      <span>▒▓▓▓▓▓▒▒▓▓▓▓▓▒▒▒▓▒▒▓▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▒</span>
      <br/>
      <span>▒▒▒▒▒▒▓▒▓▒▒▒▒▒▒▒▓▒▒▒▓▒▓▒▒▒▒▓▒▒▒▒▒▒▒▒</span>
      <br/>
      <span>▓▒▒▒▒▒▓▒▓▒▒▒▒▒▒▒▓▒▒▒▒▓▓▒▒▒▒▓▒▒▒▒▓▓▓▒</span>
      <br/>
      <span>▒▓▓▓▓▓▒▒▓▓▓▓▓▓▓▒▓▒▒▒▒▒▓▒▒▒▒▓▒▒▒▒▓▓▓▒</span>
      <br/>
      <br/>
      <span>
        ▓▓▓▓▓▓▓▒▓▒▒▒▒▒▓▒▒▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▓▒▒▒▒▓▒▒▓▓▓▓▓▒▒
      </span>
      <br/>
      <span>
        ▒▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▒▒▓▒▓▒▒▒▓▓▒▒▒▒▓▒▓▒▒▒▓▒▒▓▒▒▒▒▒▓▒
      </span>
      <br/>
      <span>
        ▒▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▒▓▒▒▒▓▒▒▓▒▓▒▒▒▓▒▓▒▒▓▒▒▒▓▒▒▒▒▒▒▒
      </span>
      <br/>
      <span>
        ▒▒▒▓▒▒▒▒▓▓▓▓▓▓▓▒▓▒▒▒▒▒▓▒▓▒▒▓▒▒▓▒▓▓▓▒▒▒▒▒▓▓▓▓▓▒▒
      </span>
      <br/>
      <span>
        ▒▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▓▓▓▓▓▓▓▒▓▒▒▒▓▒▓▒▓▒▒▓▒▒▒▒▒▒▒▒▒▓▒
      </span>
      <br/>
      <span>
        ▒▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▓▒▒▒▒▒▓▒▓▒▒▒▒▓▓▒▓▒▒▒▓▒▒▓▒▒▒▒▒▓▒
      </span>
      <br/>
      <span>
        ▒▒▒▓▒▒▒▒▓▒▒▒▒▒▓▒▓▒▒▒▒▒▓▒▓▒▒▒▒▒▓▒▓▒▒▒▒▓▒▒▓▓▓▓▓▒▒
      </span>
    </span>
  );

  function validateMessage(input) {
    const cleanedMessage = input
      .replace(/^['"`]|^\[/, "")
      .replace(/['"`]$|\]$/, "");

    if (cleanedMessage === message) {
      return <span style={error}>Same message already exists</span>;
    }

    if (cleanedMessage.length < minMessageLength) {
      return <span style={error}>Message too short</span>;
    }

    if (cleanedMessage.length > maxMessageLength) {
      return <span style={error}>Message too long</span>;
    }

    setMessage(cleanedMessage);

    if (sent) setSent(false);

    return <span style={success}>Message {message ? "updated" : "added"}</span>;
  }

  function validateFrom(input) {
    if (input === from) {
      return <span style={error}>Same name already exists</span>;
    }

    const isValid =
      input.length >= minFromLength && input.length < maxFromLength;

    if (!isValid) {
      if (input.length < minFromLength) {
        return <span style={error}>Name too short</span>;
      }

      if (input.length >= maxFromLength) {
        return <span style={error}>Name too long</span>;
      }
    }

    setFrom(input);
    if (sent) setSent(false);

    return <span style={success}>From name {from ? "updated" : "added"}</span>;
  }

  function validateEmail(input) {
    if (input === email) {
      return <span style={error}>Same email already exists</span>;
    }

    const isValid = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(input);

    if (!isValid) {
      return <span style={error}>Not a valid email</span>;
    }

    setEmail(input);

    if (sent) setSent(false);

    return (
      <span style={success}>Return email {email ? "updated" : "added"}</span>
    );
  }

  function emailCall() {
    return new Promise((res, rej) => {
      setTimeout(() => {
        // something
        return res("woohoo!");
      }, 2000);
    });
  }

  async function sendEmail() {
    try {
      await emailCall();
      setSent(new Date());
      return (
        <span style={success}>
          {isMobile ? "Email sent successfully" : thankYouMessage}
        </span>
      );
    } catch (err) {
      console.warn(err.message);
      return <span style={error}>Could not send email: {err.message}</span>;
    }
  }

  async function handleEmailLinkClick() {
    if (!navigator.clipboard) {
      try {
        document.execCommand("copy");
        console.log("success");
        return <span style={success}>Email copied to clipboard</span>;
      } catch (err) {
        console.log("failure", err);
        return <span style={error}>Could not copy email to clipboard</span>;
      }
    }

    try {
      await navigator.clipboard.writeText("email@duck.com");
      console.log("async success");
      return <span style={success}>Email copied to clipboard</span>;
    } catch (err) {
      console.log("async failure", err);
      return <span style={error}>Could not copy email to clipboard</span>;
    }
  }

  const commands = {
    help: (input) => {
      console.log("input", input);
      if (!input) {
        return (
          <span>
            <br/>
            <span style={indent1}>
              <strong>message [argument]</strong>
            </span>
            <br/>
            <span style={indent2}>adds argument as an email message</span>
            <br/>
            <span style={indent1}>
              <strong>from | name [argument]</strong>
            </span>
            <br/>
            <span style={indent2}>adds argument as your name</span>
            <br/>
            <span style={indent1}>
              <strong>email | return [argument]</strong>
            </span>
            <br/>
            <span style={indent2}>adds argument as a return email</span>
            <br/>
            <span style={indent1}>
              <strong>check</strong>
            </span>
            <br/>
            <span style={indent2}>prints current variables</span>
            <br/>
            <span style={indent1}>
              <strong>send</strong>
            </span>
            <br/>
            <span style={indent2}>emails message to me</span>
            <br/>
            <span style={indent1}>
              <strong>help -a</strong>
            </span>
            <br/>
            <span style={indent2}>lists additional commands</span>
            <br/>
            <br/>
            <span>
              ...or just send me an email at{" "}
              <span style={link} onClick={handleEmailLinkClick}>
                email
              </span>
            </span>
            <br/>
          </span>
        );
      }

      if (input === "-a") {
        return (
          <span>
            <br/>
            <span style={indent1}>
              <strong>remove | reset [message|from|email|all]</strong>
            </span>
            <br/>
            <span style={indent2}>removes specified field</span>
            <br/>
            <span style={indent1}>
              <strong>theme [theme name]</strong>
            </span>
            <br/>
            <span style={indent2}>changes terminal theme</span>
            <br/>
            <span style={indent1}>
              <strong>theme reset</strong>
            </span>
            <br/>
            <span style={indent2}>resets theme to default</span>
            <br/>
            <span style={indent1}>
              <strong>theme list</strong>
            </span>
            <br/>
            <span style={indent2}>lists available themes</span>
            <br/>
            <span style={indent1}>
              <strong>theme</strong>
            </span>
            <br/>
            <span style={indent2}>prints current theme</span>
            <br/>
            <span style={indent1}>
              <strong>clear</strong>
            </span>
            <br/>
            <span style={indent2}>clears the terminal</span>
            <br/>
            <span style={indent1}>
              <strong>help</strong>
            </span>
            <br/>
            <span style={indent2}>shows more commands</span>
            <br/>
          </span>
        );
      }

      return (
        <span style={error}>
          Can't help with <strong>{input}</strong>
        </span>
      );
    },
    message: (input) => {
      if (!input && !message) {
        return <span style={error}>No message added</span>;
      }

      if (!input && message) {
        return <span>"{message}"</span>;
      }

      return validateMessage(input);
    },
    from: (input) => {
      if (!input && !from) {
        return <span style={error}>No name added</span>;
      }

      if (!input && from) {
        return <span>"{from}"</span>;
      }

      return validateFrom(input);
    },
    get name() {
      return this.from;
    },
    email: (originalInput) => {
      let input = originalInput;

      if (originalInput.startsWith("email ")) {
        input = originalInput.split(/^(email )/)[2];
      }

      if (!input && !email) {
        return <span style={error}>No return email added</span>;
      }

      if (!input && email) {
        return <span>{email}</span>;
      }

      return validateEmail(input);
    },
    get return() {
      return this.email;
    },
    get "return email"() {
      return this.email;
    },
    send: () => {
      if (!message && !from && !email) {
        return <span style={error}>Nothing to send</span>;
      }

      if (!message && !from && email) {
        return (
          <span style={error}>
            A <strong>message</strong> and <strong>from name</strong> are
            required
          </span>
        );
      }

      if (!message && from && !email) {
        return (
          <span style={error}>
            A <strong>message</strong> and <strong>return email</strong> are
            required
          </span>
        );
      }

      if (message && !from && !email) {
        return (
          <span style={error}>
            A <strong>from name</strong> and <strong>return email</strong> are
            required
          </span>
        );
      }

      if (!message && from && email) {
        return (
          <span style={error}>
            A <strong>message</strong> is required
          </span>
        );
      }

      if (message && !from && email) {
        return (
          <span style={error}>
            A <strong>from name</strong> is required
          </span>
        );
      }

      if (message && from && !email) {
        return (
          <span style={error}>
            A <strong>return email</strong> is required
          </span>
        );
      }

      if (sent) {
        return <span style={error}>Can't send the same email twice</span>;
      }

      return sendEmail();
    },
    get "send message"() {
      return this.send;
    },
    get "send email"() {
      return this.send;
    },
    check: (input) => {
      if (input === "message") {
        return message ? (
          <span>"{message}"</span>
        ) : (
          <span style={error}>null</span>
        );
      }

      if (input === "from" || input === "name") {
        return from ? <span>{from}</span> : <span style={error}>null</span>;
      }

      if (input === "email" || input === "return" || input === "return email") {
        return email ? <span>{email}</span> : <span style={error}>null</span>;
      }

      if (!input || input === "all") {
        return (
          <span>
            {message ? (
              <span>
                <strong>message</strong>: "{message}"
              </span>
            ) : (
              <span>
                <strong>message</strong>: <span style={error}>null</span>
              </span>
            )}
            <br/>
            {from ? (
              <span>
                <strong>from</strong>: {from}
              </span>
            ) : (
              <span>
                <strong>from</strong>: <span style={error}>null</span>
              </span>
            )}
            <br/>
            {email ? (
              <span>
                <strong>return email</strong>: {email}
              </span>
            ) : (
              <span>
                <strong>return email</strong>: <span style={error}>null</span>
              </span>
            )}
            {sent && (
              <span>
                <br/>
                <span style={success}>
                  <strong>Sent</strong> {getTimeAgo(sent)}
                </span>
              </span>
            )}
          </span>
        );
      }

      return (
        <span>
          Can't check <strong>{input}</strong>
        </span>
      );
    },
    remove: (input) => {
      if (!input) {
        return <span style={error}>Specify what to remove</span>;
      }

      if (input === "message") {
        if (!message) {
          return (
            <span style={error}>
              No <strong>message</strong> to remove
            </span>
          );
        }
        setMessage(null);
        if (sent) setSent(false);
        return (
          <span style={success}>
            Removed <strong>message</strong>
          </span>
        );
      }

      if (input === "from" || input === "name" || input === "from name") {
        if (!from) {
          return (
            <span style={error}>
              No <strong>from name</strong> to remove
            </span>
          );
        }

        setFrom(null);
        if (sent) setSent(false);
        return (
          <span style={success}>
            Removed <strong>from name</strong>
          </span>
        );
      }

      if (input === "email" || input === "return" || input === "return email") {
        if (!email) {
          return (
            <span style={error}>
              No return <strong>email</strong> to remove
            </span>
          );
        }

        setEmail(null);
        if (sent) setSent(false);
        return (
          <span style={success}>
            Removed return <strong>email</strong>
          </span>
        );
      }

      if (input === "all") {
        setMessage(null);
        setFrom(null);
        setEmail(null);
        if (sent) setSent(false);

        if (!message && !from && !email) {
          return <span style={error}>Nothing to remove</span>;
        }

        if (message && !from && !email) {
          return (
            <span style={success}>
              Removed <strong>message</strong>. No <strong>from</strong> name or
              return <strong>email</strong>
            </span>
          );
        }

        if (!message && from && !email) {
          return (
            <span style={success}>
              Removed <strong>from</strong> name. No <strong>message</strong> or
              return <strong>email</strong>
            </span>
          );
        }

        if (!message && !from && email) {
          return (
            <span style={success}>
              Removed return <strong>email</strong>. No <strong>message</strong>{" "}
              or <strong>from</strong> name
            </span>
          );
        }

        if (message && !from && email) {
          return (
            <span style={success}>
              Removed <strong>message</strong> and return <strong>email</strong>
              . No <strong>from</strong> name
            </span>
          );
        }

        if (message && from && !email) {
          return (
            <span style={success}>
              Removed <strong>message</strong> and <strong>from</strong> name.
              No return <strong>email</strong>
            </span>
          );
        }

        if (!message && from && email) {
          return (
            <span style={success}>
              Removed <strong>from</strong> name and return{" "}
              <strong>email</strong>. No <strong>from</strong> name
            </span>
          );
        }

        return <span style={success}>Removed all</span>;
      }

      return (
        <span style={error}>
          Can't remove <strong>{input}</strong>
        </span>
      );
    },
    get reset() {
      return this.remove;
    },
    theme: (input) => {
      const themeList = Object.keys(themes);

      if (!input) {
        return (
          <span>
            Current theme is <strong>{theme}</strong>
          </span>
        );
      }

      if (input === "list") {
        return (
          <span>
            {themeList.map((themeName, i) =>
              themeName === theme ? (
                <span key={themeName}>
                  <strong>
                    *{" "}
                    {themeName === "portfolio"
                      ? themeName + " (default)"
                      : themeName}
                    {i !== themeList.length - 1 && <br/>}
                  </strong>
                </span>
              ) : (
                <span key={themeName} style={{marginLeft: 22}}>
                  {themeName === "portfolio"
                    ? themeName + " (default)"
                    : themeName}
                  {i !== themeList.length - 1 && <br/>}
                </span>
              )
            )}
          </span>
        );
      }

      if (themeList.some((theme) => theme === input)) {
        if (input === theme) {
          return (
            <span>
              Already using{" "}
              <strong>
                {input === "portfolio" ? input + " (default)" : input}
              </strong>{" "}
              theme
            </span>
          );
        }

        setTheme(input);
        return (
          <span>
            Switched to{" "}
            <strong>
              {input === "portfolio" ? input + " (default)" : input}
            </strong>{" "}
            theme
          </span>
        );
      }

      if (
        input === "default" ||
        input === "portfolio (default)" ||
        input === "reset"
      ) {
        if (theme === "portfolio") {
          return (
            <span>
              Already using <strong>portfolio</strong> (default) theme
            </span>
          );
        }

        setTheme("portfolio");
        return (
          <span>
            Switched to <strong>portfolio</strong> (default) theme
          </span>
        );
      }

      return (
        <span style={error}>
          No <strong>{input}</strong> theme
        </span>
      );
    }
  };

  return <div
    style={{
      height: 250,
      maxHeight: "100vh",
      width: "100%",
      maxWidth: "100vw"
    }}
  >
    <ReactTerminal
      commands={commands}
      prompt="$"
      welcomeMessage={welcomeMessage}
      errorMessage={<span style={error}>Command not found</span>}
      themes={themes}
      theme={theme}
    />
  </div>
};

export default TerminalComponent;
