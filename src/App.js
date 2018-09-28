import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { mainActions } from './state/modules/main';
import 'vis/dist/vis-network.min.css';
import './App.css';
import { renderGraph } from './renderer';

const App =
  ({
    getServices,
    fileChangedHandler,
    togglePhysics,
    toggleLabel,
    toggleComplication,
    showLabel,
    enablePhysics,
    enableComplication,
    files
  }) =>
    (
      <div className='App'>
        <div className='controls'>
          <form onSubmit={getServices}>
            <label htmlFor='file-upload' className='btn btn-dark'>
              Upload serverless.yml files
            </label>
            <input
              id='file-upload'
              type='file'
              className='btn btn-dark'
              onChange={fileChangedHandler}
              multiple />
            <button type='submit' className='btn btn-info'>
              Process {files.length > 0 ? `${files.length} services` : null}
            </button>
          </form>
          <button className={enablePhysics ? 'btn btn-success' : 'btn btn-secondary'}
            onClick={togglePhysics}>
            {enablePhysics ? 'Disable' : 'Enable'} Physics
          </button>
          <button className={showLabel ? 'btn btn-success' : 'btn btn-secondary'}
            onClick={toggleLabel}>
            {showLabel ? 'Hide' : 'Show'} dependency properties
          </button>
          <button className={enableComplication ? 'btn btn-success' : 'btn btn-secondary'}
            onClick={toggleComplication}>
            {enableComplication ? 'Disable' : 'Enable'} detailed view
          </button>
        </div>
        <div id='output'></div>
      </div>
    );

const mapStateToProps = (state) => ({
  services: state.main.services
});

const mapDispatchToProps = (dispatch) => ({
  fetchServices: bindActionCreators(mainActions.main.fetchServices, dispatch)
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStateHandlers(
    {
      enablePhysics: true,
      showLabel: false,
      enableComplication: false,
      files: [],
    },
    {
      setFinished: () => (finished) => ({ finished }),
      togglePhysics: ({ enablePhysics }) => () => ({ enablePhysics: !enablePhysics }),
      toggleLabel: ({ showLabel }) => () => ({ showLabel: !showLabel }),
      toggleComplication: ({ enableComplication }) => () => ({ enableComplication: !enableComplication }),
      fileChangedHandler: () => (event) => ({ files: event.target.files })
    }
  ),
  lifecycle({
    componentDidUpdate() {
      const { services, enablePhysics, showLabel, enableComplication } = this.props;
      if (services && services.length > 0) {
        renderGraph(services, enablePhysics, showLabel, enableComplication);
      }
    }
  }),
  withHandlers({
    getServices: ({ fetchServices, files }) => (e) => {
      e.preventDefault();
      fetchServices(files);
    }
  })
)(App);
