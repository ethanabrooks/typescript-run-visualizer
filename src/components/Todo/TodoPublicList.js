import React, { Fragment, useState, useEffect } from "react";
import { useSubscription, useApolloClient, gql } from "@apollo/client";
import TaskItem from "./TaskItem";

const RunLogs = props => {
  const [state, setState] = useState({
    olderLogsAvailable: props.latestLog ? true : false,
    newLogsCount: 0,
    error: false,
    logs: []
  });

  let numTodos = state.logs.length;
  let oldestTodoId = numTodos
    ? state.logs[numTodos - 1].id
    : props.latestLog
      ? props.latestLog.id + 1
      : 0;
  let newestTodoId = numTodos
    ? state.logs[0].id
    : props.latestLog
      ? props.latestLog.id
      : 0;

  const client = useApolloClient();

  useEffect(() => {
    loadOlder();
  }, []);

  useEffect(
    () => {
      if (props.latestLog && props.latestLog.id > newestTodoId) {
        setState(prevState => {
          return { ...prevState, newTodosCount: prevState.newLogsCount + 1 };
        });
        newestTodoId = props.latestLog.id;
      }
    },
    [props.latestLog]
  );

  const loadOlder = async () => {
    const GET_OLD_LOGS = gql`
      query getOldLogs($oldestLogId: Int) {
        run_log(where: { id: { _lt: $oldestLogId } }, order_by: { id: asc }) {
          id
          log
          runid
        }
      }
    `;

    const { error, data } = await client.query({
      query: GET_OLD_LOGS,
      variables: { oldestLogId: oldestTodoId }
    });
    console.log(data);

    if (data.run_log.length) {
      setState(prevState => {
        return { ...prevState, logs: [...prevState.logs, ...data.run_log] };
      });
      oldestTodoId = data.run_log[data.run_log.length - 1].id;
    } else {
      setState(prevState => {
        return { ...prevState, olderTodosAvailable: false };
      });
    }
    if (error) {
      console.error(error);
      setState(prevState => {
        return { ...prevState, error: true };
      });
    }
  };

  const loadNew = async () => {
    const GET_NEW_PUBLIC_TODOS = gql`
      query getNewLogs($latestVisibleId: Int) {
        run_log(
          where: { id: { _gt: $latestVisibleId } }
          order_by: { id: asc }
        ) {
          id
          log
          runid
        }
      }
    `;

    const { error, data } = await client.query({
      query: GET_NEW_PUBLIC_TODOS,
      variables: {
        latestVisibleId: state.logs.length ? state.logs[0].id : null
      }
    });

    if (data) {
      setState(prevState => {
        return {
          ...prevState,
          logs: [...data.run_log, ...prevState.logs],
          newLogsCount: 0
        };
      });
      newestTodoId = data.run_log[0].id;
    }
    if (error) {
      console.error(error);
      setState(prevState => {
        return { ...prevState, error: true };
      });
    }
  };

  return (
    <Fragment>
      <div className="todoListWrapper">
        {state.newLogsCount !== 0 && (
          <div className={"loadMoreSection"} onClick={loadNew}>
            New tasks have arrived! ({state.newLogsCount.toString()})
          </div>
        )}

        <ul>
          {state.logs &&
            state.logs.map((log, index) => {
              console.log(log.log);
            })}
        </ul>

        <div className={"loadMoreSection"} onClick={loadOlder}>
          {state.olderLogsAvailable
            ? "Load older tasks"
            : "No more public tasks!"}
        </div>
      </div>
    </Fragment>
  );
};

// Run a subscription to get the latest public todo
const NOTIFY_NEW_RUN_LOG = gql`
  subscription notifyNewRunLog($sweepId: Int!) {
    run_log(
      where: { run: { sweepid: { _eq: $sweepId } } }
      limit: 1
      order_by: { id: desc }
    ) {
      id
      log
      runid
    }
  }
`;
// const NOTIFY_NEW_PUBLIC_TODOS = gql`
//   subscription notifyNewPublicTodos {
//     todos(
//       where: { is_public: { _eq: true } }
//       limit: 1
//       order_by: { created_at: desc }
//     ) {
//       id
//       created_at
//     }
//   }
// `;

const RunLogSubscription = ({ sweepId }) => {
  const { loading, error, data } = useSubscription(NOTIFY_NEW_RUN_LOG, {
    variables: { sweepId: sweepId }
  });
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.log(error);
    return <span>Error</span>;
  }
  return <RunLogs latestLog={data.run_log.length ? data.run_log[0] : null} />;
};
export default RunLogSubscription;
